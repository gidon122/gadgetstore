import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import authSeller from "@/lib/authSeller";
import mongoose from "mongoose";

// GET /api/orders/:id - Fetch single order details
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
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

    // Verify ownership or seller authorization
    const isSeller = await authSeller(userId);
    if (order.userId !== userId && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You do not have permission to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order retrieved successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/:id - Update order status or payment status
export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, orderStatus, paymentStatus } = body;

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

    const isSeller = await authSeller(userId);

    // Regular users can only cancel their own pending/Order Placed orders
    const isOwnerCancelling =
      order.userId === userId &&
      (status === "cancelled" || orderStatus === "cancelled") &&
      (order.status === "Order Placed" || order.status === "pending" || order.orderStatus === "pending");

    if (!isSeller && !isOwnerCancelling) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Seller authorization required to update order" },
        { status: 403 }
      );
    }

    const targetStatus = status || orderStatus;
    if (targetStatus) {
      const allowedStatuses = [
        "Order Placed",
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!allowedStatuses.includes(targetStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
      order.status = targetStatus;
      order.orderStatus = targetStatus;
    }

    if (paymentStatus && isSeller) {
      const allowedPaymentStatuses = ["Pending", "pending", "Paid", "paid", "Failed", "failed"];
      if (allowedPaymentStatuses.includes(paymentStatus)) {
        order.paymentStatus = paymentStatus;
      }
    }

    await order.save();

    // Create notification for the user when status is updated
    if (targetStatus) {
      try {
        await Notification.create({
          userId: order.userId,
          type: "order",
          title: "Order Status Updated",
          message: `Your order #${order.orderNumber} status is now: ${targetStatus}`,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        });
      } catch (notifErr) {
        console.error("Failed to notify user of order update:", notifErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update order",
      },
      { status: 500 }
    );
  }
}
