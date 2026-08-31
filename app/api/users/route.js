import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await connectDB();

    const primaryEmail =
      clerkUser.emailAddresses?.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "";

    const name =
      clerkUser.fullName ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      "User";

    const user = await User.findOneAndUpdate(
      { $or: [{ _id: userId }, { id: userId }] },
      {
        $set: {
          _id: userId,
          id: userId,
          name,
          email: primaryEmail,
          imageUrl: clerkUser.imageUrl || "",
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/users:", error);

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}