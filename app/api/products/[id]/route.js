import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// GET /api/products/:id - Retrieve single product details
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ _id: id });
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product retrieved successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/products/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}
