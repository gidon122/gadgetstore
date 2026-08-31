import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Notification from "@/models/Notification";

// PATCH /api/notifications/read-all - Mark all user's notifications as read
export async function PATCH() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json(
      {
        success: true,
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/notifications/read-all:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update notifications",
      },
      { status: 500 }
    );
  }
}
