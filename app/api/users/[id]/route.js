import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId || userId !== id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const allowedUpdates = {};

    if (body.name !== undefined) {
      allowedUpdates.name = body.name;
    }

    if (body.imageUrl !== undefined) {
      allowedUpdates.imageUrl = body.imageUrl;
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { $or: [{ _id: userId }, { id: userId }] },
      { $set: allowedUpdates },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in PATCH /api/users/[id]:", error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId || userId !== id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const deletedUser = await User.findOneAndDelete({
      $or: [{ _id: userId }, { id: userId }],
    });

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/users/[id]:", error);

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}