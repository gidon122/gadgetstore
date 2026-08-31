import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import authSeller from "@/lib/authSeller";
import mongoose from "mongoose";

// 1. GET /api/orders - Retrieve authenticated user's orders (or all orders for seller if ?seller=true)
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const isSellerQuery = searchParams.get("seller") === "true";

    let orders;
    if (isSellerQuery) {
      const isSeller = await authSeller(userId);
      if (!isSeller) {
        return NextResponse.json(
          { success: false, message: "Unauthorized: Seller access required" },
          { status: 403 }
        );
      }
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Orders retrieved successfully",
        orders,
        count: orders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

// 2. POST /api/orders - Place / Create a new order
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      address,
      shippingAddress,
      addressId,
      shippingAddressId,
      items: rawItems,
      cartItems: rawCartItems,
      paymentMethod = "COD",
      paymentStatus = "pending",
      orderStatus = "pending",
      status,
    } = body;

    await connectDB();

    // 1. Resolve and Validate Delivery Address
    let addressData = null;
    const targetAddress = address || shippingAddress;
    const targetAddressId = addressId || shippingAddressId;

    if (
      targetAddress &&
      typeof targetAddress === "object" &&
      targetAddress.fullName &&
      targetAddress.area &&
      targetAddress.city &&
      targetAddress.state
    ) {
      addressData = {
        _id: targetAddress._id || undefined,
        userId,
        fullName: String(targetAddress.fullName).trim(),
        phoneNumber: String(targetAddress.phoneNumber || "").trim(),
        pincode: String(targetAddress.pincode || "").trim(),
        area: String(targetAddress.area).trim(),
        city: String(targetAddress.city).trim(),
        state: String(targetAddress.state).trim(),
        country: String(targetAddress.country || "United States").trim(),
      };
    } else if (targetAddressId && mongoose.Types.ObjectId.isValid(targetAddressId)) {
      const dbAddress = await Address.findOne({ _id: targetAddressId, userId });
      if (dbAddress) {
        addressData = {
          _id: dbAddress._id.toString(),
          userId,
          fullName: dbAddress.fullName,
          phoneNumber: dbAddress.phoneNumber,
          pincode: dbAddress.pincode,
          area: dbAddress.area,
          city: dbAddress.city,
          state: dbAddress.state,
          country: dbAddress.country || "United States",
        };
      }
    } else {
      // Fallback: look up user's latest saved address
      const latestAddress = await Address.findOne({ userId }).sort({ createdAt: -1 });
      if (latestAddress) {
        addressData = {
          _id: latestAddress._id.toString(),
          userId,
          fullName: latestAddress.fullName,
          phoneNumber: latestAddress.phoneNumber,
          pincode: latestAddress.pincode,
          area: latestAddress.area,
          city: latestAddress.city,
          state: latestAddress.state,
          country: latestAddress.country || "United States",
        };
      }
    }

    if (!addressData || !addressData.fullName || !addressData.area || !addressData.city || !addressData.state) {
      return NextResponse.json(
        { success: false, message: "A valid delivery address is required to place an order" },
        { status: 400 }
      );
    }

    // 2. Fetch User & Cart Items
    const user = await User.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Determine cart items (either provided explicitly or read from user.cartItems)
    const cartItemsMap = rawItems || rawCartItems || user.cartItems || {};
    const itemEntries = [];

    if (Array.isArray(cartItemsMap)) {
      cartItemsMap.forEach((entry) => {
        const pId = entry.productId || entry.product?._id || entry.id || entry._id;
        const qty = Number(entry.quantity);
        if (pId && !isNaN(qty) && qty > 0) {
          itemEntries.push({ productId: pId.toString(), quantity: Math.floor(qty) });
        }
      });
    } else if (typeof cartItemsMap === "object" && cartItemsMap !== null) {
      Object.keys(cartItemsMap).forEach((pId) => {
        const rawVal = cartItemsMap[pId];
        const qty = typeof rawVal === "number" ? rawVal : Number(rawVal?.quantity);
        if (pId && !isNaN(qty) && qty > 0) {
          itemEntries.push({ productId: pId.toString(), quantity: Math.floor(qty) });
        }
      });
    }

    if (itemEntries.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cannot place an order with an empty cart" },
        { status: 400 }
      );
    }

    // 3. Verify Products & Snapshot Prices Securely from DB
    const productIds = itemEntries.map((e) => e.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    let itemsSubtotal = 0;

    for (const item of itemEntries) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product with ID ${item.productId} is no longer available` },
          { status: 404 }
        );
      }

      // Secure unit price snapshot at time of purchase
      const unitPrice =
        product.offerPrice !== undefined && product.offerPrice !== null
          ? product.offerPrice
          : product.price;

      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
      itemsSubtotal += subtotal;

      orderItems.push({
        product: {
          _id: product._id.toString(),
          userId: product.userId,
          name: product.name,
          description: product.description,
          price: product.price,
          offerPrice: product.offerPrice,
          image: product.image,
          category: product.category,
        },
        productId: product._id.toString(),
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: unitPrice,
        subtotal,
      });
    }

    // 4. Calculate Final Order Amount (including 2% tax) securely on backend
    const tax = Math.floor(itemsSubtotal * 0.02);
    const totalAmount = Math.round((itemsSubtotal + tax) * 100) / 100;

    // 5. Generate Unique Order Number
    const orderNumber =
      "ORD-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    const initialStatus = status || orderStatus || "pending";

    const orderPayload = {
      userId,
      orderNumber,
      items: orderItems,
      amount: totalAmount,
      totalAmount,
      address: addressData,
      shippingAddress: addressData,
      status: initialStatus,
      orderStatus: initialStatus,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentStatus || "pending",
      date: Date.now(),
    };

    // 6. Save Order & Clear Cart (Using Database Transaction if supported)
    let newOrder;
    let session = null;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const createdOrders = await Order.create([orderPayload], { session });
      newOrder = createdOrders[0];

      // Clear user's cart in DB
      user.cartItems = {};
      user.markModified("cartItems");
      await user.save({ session });

      await session.commitTransaction();
    } catch (transactionErr) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      // If transactions are not supported (e.g. standalone MongoDB instance), execute sequentially
      if (
        transactionErr.message?.includes("replica set") ||
        transactionErr.message?.includes("Transaction numbers") ||
        transactionErr.name === "MongoServerError"
      ) {
        newOrder = await Order.create(orderPayload);
        user.cartItems = {};
        user.markModified("cartItems");
        await user.save();
      } else {
        throw transactionErr;
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }

    // 7. Create Order Confirmation Notification for User
    try {
      await Notification.create({
        userId,
        type: "order",
        title: "Order Placed",
        message: `Your order #${newOrder.orderNumber} has been placed successfully.`,
        orderId: newOrder._id.toString(),
        orderNumber: newOrder.orderNumber,
      });
    } catch (notifErr) {
      console.error("Failed to create order notification:", notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to place order",
      },
      { status: 500 }
    );
  }
}
