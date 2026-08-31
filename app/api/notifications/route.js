import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Notification from "@/models/Notification";

// GET /api/notifications - Retrieve authenticated user's notifications
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return NextResponse.json(
      {
        success: true,
        message: "Notifications retrieved successfully",
        notifications,
        unreadCount,
        count: notifications.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}
