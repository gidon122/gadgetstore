import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import Product from "@/models/Product";
import mongoose from "mongoose";

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
    const productId = body.productId || body.itemId || body.id;
    const quantity = body.quantity !== undefined ? Number(body.quantity) : 1;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a valid number of at least 1" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify product exists in database
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    if (!product) {
      product = await Product.findOne({ _id: productId });
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Find or sync user document
    let user = await User.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    if (!user) {
      const clerkUser = await currentUser();
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

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize cartItems if missing
    if (!user.cartItems || typeof user.cartItems !== "object") {
      user.cartItems = {};
    }

    // Check if product already exists in user's cart
    const existingEntry = user.cartItems[productId];
    let previousQuantity = 0;

    if (typeof existingEntry === "number") {
      previousQuantity = existingEntry;
    } else if (typeof existingEntry === "object" && existingEntry !== null) {
      previousQuantity = Number(existingEntry.quantity) || 0;
    }

    const newQuantity = previousQuantity + quantity;
    const isExisting = previousQuantity > 0;

    // Update cart item with new quantity
    user.cartItems[productId] = newQuantity;
    user.markModified("cartItems");
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: isExisting
          ? `Product quantity updated to ${newQuantity}`
          : "Product added to cart successfully",
        cartItem: {
          productId: product._id.toString(),
          quantity: newQuantity,
          product: {
            _id: product._id.toString(),
            name: product.name,
            price: product.price,
            offerPrice: product.offerPrice,
            image: product.image,
            category: product.category,
            description: product.description,
          },
        },
        cartItems: user.cartItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/cart/add:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}
