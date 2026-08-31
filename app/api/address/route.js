import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";
import mongoose from "mongoose";

// Helper function to validate address fields
function validateAddressData(data) {
  const { fullName, phoneNumber, pincode, area, city, state } = data;

  if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
    return "Full name is required";
  }
  if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
    return "Phone number is required";
  }
  if (!pincode || (typeof pincode !== "string" && typeof pincode !== "number") || String(pincode).trim() === "") {
    return "Pincode is required";
  }
  if (!area || typeof area !== "string" || area.trim() === "") {
    return "Address area and street are required";
  }
  if (!city || typeof city !== "string" || city.trim() === "") {
    return "City is required";
  }
  if (!state || typeof state !== "string" || state.trim() === "") {
    return "State is required";
  }

  return null;
}

// 1. GET /api/address - Retrieve the authenticated user's address(es)
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    if (!addresses || addresses.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No saved address found",
          address: null,
          addresses: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address retrieved successfully",
        address: addresses[0],
        addresses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/address:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch address",
      },
      { status: 500 }
    );
  }
}

// 2. POST /api/address - Save or update the authenticated user's address
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const validationError = validateAddressData(body);

    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const {
      addressId,
      fullName,
      phoneNumber,
      pincode,
      area,
      city,
      state,
      country,
    } = body;

    await connectDB();

    const addressPayload = {
      userId,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      pincode: String(pincode).trim(),
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),
      country: (country || "United States").trim(),
    };

    let savedAddress;

    // If an addressId is provided, update that specific address
    if (addressId && mongoose.Types.ObjectId.isValid(addressId)) {
      savedAddress = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { $set: addressPayload },
        { returnDocument: "after", runValidators: true }
      );
    }

    // If no specific addressId was provided or found, check if the user already has an existing address
    if (!savedAddress) {
      const existingAddress = await Address.findOne({ userId });

      if (existingAddress) {
        // Update existing address instead of creating duplicate
        savedAddress = await Address.findByIdAndUpdate(
          existingAddress._id,
          { $set: addressPayload },
          { returnDocument: "after", runValidators: true }
        );
      } else {
        // Create new address record
        savedAddress = await Address.create(addressPayload);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address saved successfully",
        address: savedAddress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/address:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save address",
      },
      { status: 500 }
    );
  }
}

// 3. PUT /api/address - Update an existing address
export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const validationError = validateAddressData(body);

    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const {
      addressId,
      fullName,
      phoneNumber,
      pincode,
      area,
      city,
      state,
      country,
    } = body;

    await connectDB();

    const updatePayload = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      pincode: String(pincode).trim(),
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),
      country: (country || "United States").trim(),
    };

    let query = { userId };
    if (addressId && mongoose.Types.ObjectId.isValid(addressId)) {
      query = { _id: addressId, userId };
    }

    const updatedAddress = await Address.findOneAndUpdate(
      query,
      { $set: updatePayload },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found to update" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address updated successfully",
        address: updatedAddress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/address:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update address",
      },
      { status: 500 }
    );
  }
}

// 4. DELETE /api/address - Delete an address
export async function DELETE(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { addressId } = body;

    await connectDB();

    let query = { userId };
    if (addressId && mongoose.Types.ObjectId.isValid(addressId)) {
      query = { _id: addressId, userId };
    }

    const deletedAddress = await Address.findOneAndDelete(query);

    if (!deletedAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/address:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete address",
      },
      { status: 500 }
    );
  }
}
