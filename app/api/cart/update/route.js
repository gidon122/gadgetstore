import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
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

    const { cartData } = await request.json().catch(() => ({}));

    if (!cartData || typeof cartData !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid cart data format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch user
    let user = await User.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const normalizedCart = {};
    const productIds = Object.keys(cartData);

    for (const productId of productIds) {
      const entry = cartData[productId];
      const quantity =
        typeof entry === "number" ? entry : Number(entry?.quantity);

      if (isNaN(quantity) || quantity < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid quantity for product ${productId}`,
          },
          { status: 400 }
        );
      }

      if (quantity === 0) {
        continue; // Skip or remove 0-quantity items
      }

      // Check if product exists
      let product = null;
      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId);
      }
      if (!product) {
        product = await Product.findOne({ _id: productId });
      }

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${productId} not found`,
          },
          { status: 404 }
        );
      }

      normalizedCart[productId] = quantity;
    }

    // Update user's cart
    user.cartItems = normalizedCart;
    user.markModified("cartItems");
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Cart updated successfully",
        cartItems: user.cartItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/cart/update:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update cart",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { productId } = await request.json().catch(() => ({}));

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.cartItems && user.cartItems[productId] !== undefined) {
      delete user.cartItems[productId];
      user.markModified("cartItems");
      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: "Item removed from cart",
          cartItems: user.cartItems,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Item not found in cart" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/cart/update:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove item from cart",
      },
      { status: 500 }
    );
  }
}