import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import authSeller from "@/lib/authSeller";
import mongoose from "mongoose";

// PATCH /api/orders/:id/status - Update order status (Seller/Admin only)
export async function PATCH(request, { params }) {
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
        { success: false, message: "Forbidden: Seller access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, orderStatus } = body;
    const targetStatus = status || orderStatus;

    const allowedStatuses = [
      "Order Placed",
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!targetStatus || !allowedStatuses.includes(targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({
        $or: [{ _id: id }, { orderNumber: id }],
      });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    order.status = targetStatus;
    order.orderStatus = targetStatus;
    await order.save();

    // Create notification for customer
    try {
      await Notification.create({
        userId: order.userId,
        type: "order",
        title: "Order Status Updated",
        message: `Your order #${order.orderNumber} status has been updated to ${targetStatus}.`,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      });
    } catch (notifErr) {
      console.error("Failed to create status update notification:", notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]/status:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update order status",
      },
      { status: 500 }
    );
  }
}
