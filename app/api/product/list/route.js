import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, products, count: products.length }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/product/list:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}
