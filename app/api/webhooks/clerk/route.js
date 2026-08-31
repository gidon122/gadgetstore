import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Verifies Clerk's signed webhook request.
    const event = await verifyWebhook(request);

    const { type, data } = event;

    await connectDB();

    if (type === "user.deleted") {
      await User.findOneAndDelete({
        $or: [{ _id: data.id }, { id: data.id }],
      });

      return NextResponse.json({
        message: "User deleted successfully",
      });
    }

    if (type === "user.created" || type === "user.updated") {
      const primaryEmail =
        data.email_addresses?.find(
          (email) => email.id === data.primary_email_address_id
        )?.email_address || data.email_addresses?.[0]?.email_address;

      const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        "User";

      const user = await User.findOneAndUpdate(
        { $or: [{ _id: data.id }, { id: data.id }] },
        {
          $set: {
            _id: data.id,
            id: data.id,
            name,
            email: primaryEmail,
            imageUrl: data.image_url || "",
          },
        },
        {
          returnDocument: "after",
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      return NextResponse.json({
        message: `User ${type === "user.created" ? "created" : "updated"} successfully`,
        user,
      });
    }

    return NextResponse.json({
      message: `Ignored event: ${type}`,
    });
  } catch (error) {
    console.error("Clerk webhook error:", error);

    return NextResponse.json(
      { error: "Invalid webhook request" },
      { status: 400 }
    );
  }
}