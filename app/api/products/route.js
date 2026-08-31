import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// GET /api/products - Retrieve all products from database
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    const filter = {};
    if (category && category !== "All") {
      filter.category = new RegExp(`^${category}$`, "i");
    }
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ date: -1, createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "Products retrieved successfully",
        products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
