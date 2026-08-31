import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/db";

export async function GET() {
  try {
    await connectDB();

    const collections = await mongoose.connection.db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      database: "connected",
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: collections.map((col) => col.name),
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        database: "disconnected",
        error: error instanceof Error ? error.message : "Database connection error",
      },
      { status: 500 }
    );
  }
}