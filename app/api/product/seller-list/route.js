import { auth, getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    let userId = null;
    try {
      const authData = await auth();
      userId = authData?.userId;
    } catch {
      const authData = getAuth(request);
      userId = authData?.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Seller access required" },
        { status: 403 }
      );
    }

    await connectDB();
    const products = await Product.find({ userId }).sort({ date: -1, createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "Seller products retrieved successfully",
        products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/product/seller-list:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}
