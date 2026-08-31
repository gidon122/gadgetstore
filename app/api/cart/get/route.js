import connectDB from "@/config/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch user
    let user = await User.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    // If user record doesn't exist yet, sync it
    if (!user) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const primaryEmail =
          clerkUser?.emailAddresses?.find(
            (email) => email.id === clerkUser.primaryEmailAddressId
          )?.emailAddress ||
          clerkUser?.emailAddresses?.[0]?.emailAddress ||
          "";

        const name =
          clerkUser?.fullName ||
          [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
          "User";

        user = await User.findOneAndUpdate(
          { $or: [{ _id: userId }, { id: userId }] },
          {
            $set: {
              _id: userId,
              id: userId,
              name,
              email: primaryEmail,
              imageUrl: clerkUser?.imageUrl || "",
              cartItems: {},
            },
          },
          {
            returnDocument: "after",
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    }

    const cartItems = user?.cartItems || {};
    const productIds = Object.keys(cartItems).filter((productId) => {
      const item = cartItems[productId];
      const qty = typeof item === "number" ? item : item?.quantity;
      return qty && qty > 0;
    });

    // Handle empty cart
    if (productIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          cartItems: [],
          rawCartItems: {},
          totalItems: 0,
          totalPrice: 0,
          message: "Cart is empty",
        },
        { status: 200 }
      );
    }

    // Fetch all corresponding products
    const products = await Product.find({ _id: { $in: productIds } });

    // Map products for fast O(1) lookup
    const productMap = new Map();
    products.forEach((product) => {
      productMap.set(product._id.toString(), product);
    });

    // Enriched list of cart items
    const enrichedCartItems = productIds
      .map((productId) => {
        const product = productMap.get(productId.toString());
        if (!product) {
          return null; // Product no longer exists in DB
        }

        const rawItem = cartItems[productId];
        const quantity =
          typeof rawItem === "number" ? rawItem : Number(rawItem?.quantity) || 1;

        const unitPrice =
          product.offerPrice !== undefined && product.offerPrice !== null
            ? product.offerPrice
            : product.price;

        const subtotal = Math.round(unitPrice * quantity * 100) / 100;

        return {
          productId: product._id.toString(),
          quantity,
          unitPrice,
          subtotal,
          productDetails: {
            id: product._id.toString(),
            _id: product._id.toString(),
            name: product.name,
            price: product.price,
            offerPrice: product.offerPrice,
            image: product.image,
            category: product.category,
            description: product.description,
          },
        };
      })
      .filter(Boolean);

    const totalItems = enrichedCartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const totalPrice =
      Math.round(
        enrichedCartItems.reduce((sum, item) => sum + item.subtotal, 0) * 100
      ) / 100;

    return NextResponse.json(
      {
        success: true,
        cartItems: enrichedCartItems,
        rawCartItems: cartItems,
        totalItems,
        totalPrice,
        message: "Cart retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/cart/get:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}