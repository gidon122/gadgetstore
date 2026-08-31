import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import authSeller from "@/lib/authSeller";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Seller access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "Seller orders retrieved successfully",
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/seller/orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch seller orders",
      },
      { status: 500 }
    );
  }
}
