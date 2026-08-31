import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    let user = await User.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    // If user is not yet in MongoDB (e.g., local dev without webhooks, or new user),
    // sync and save the user document from Clerk data
    if (!user) {
      const clerkUser = await currentUser();

      if (clerkUser) {
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

        user = await User.findOneAndUpdate(
          { $or: [{ _id: userId }, { id: userId }] },
          {
            $set: {
              _id: userId,
              id: userId,
              name,
              email: primaryEmail,
              imageUrl: clerkUser.imageUrl || "",
              cartItems: {},
            },
          },
          {
            returnDocument: "after",
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/user/data:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}