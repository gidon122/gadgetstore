import { v2 as cloudinary } from "cloudinary";
import { auth, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";
import connectDB from "@/config/db";
import Product from "@/models/Product";

// Helper to configure and validate Cloudinary
function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    cloudinary.config({ cloudinary_url: cloudinaryUrl });
    return true;
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }

  return false;
}

export async function POST(request) {
    try {
        let userId = null;
        try {
            const authData = await auth();
            userId = authData?.userId;
        } catch {
            const authData = getAuth(request);
            userId = authData?.userId;
        }

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
        }

        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Forbidden: Seller access required' }, { status: 403 });
        }

        const isConfigured = configureCloudinary();
        if (!isConfigured) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cloudinary credentials missing. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel Project Environment Variables."
                },
                { status: 500 }
            );
        }

        const formData = await request.formData();

        const name = formData.get('name');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const offerPrice = formData.get('offerPrice');

        if (!name || !description || !category || !price || !offerPrice) {
            return NextResponse.json({ success: false, message: 'All product fields are required' }, { status: 400 });
        }

        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: 'At least one product image is required' }, { status: 400 });
        }

        const result = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto', folder: 'products' },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                    stream.end(buffer);
                });
            })
        );

        const image = result.map(res => res.secure_url);

        await connectDB();
        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image,
            date: Date.now()
        });

        return NextResponse.json({ success: true, message: 'Product added successfully', newProduct }, { status: 201 });
        
    } catch (error) {
        console.error("Error in POST /api/product/add:", error);
        return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Failed to add product" }, { status: 500 });
    }
}