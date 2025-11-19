import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { verifyAdminAccess, FARMER_COLLECTIONS } from "@/app/api/admin/verify-access";

export async function GET(request: NextRequest) {
  try {
    const databases = getServerAppwrite();

    // Fetch all products from main products collection
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PRODUCTS || "products",
      [{ method: "limit", value: 100 }]
    );

    const products = response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name,
      variant: doc.variant || "",
      fullPrice: doc.fullPrice,
      discount: doc.discount || 0,
      finalPrice: doc.finalPrice,
      stock: doc.stock || 0,
      description: doc.description || "",
      images: doc.images ? JSON.parse(doc.images) : [],
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, variant, fullPrice, discount, stock, description, images, farmer_id } =
      await request.json();

    // Validate required fields
    if (!name || !fullPrice || stock === undefined || !farmer_id) {
      return NextResponse.json(
        { error: "Missing required fields: name, fullPrice, stock, farmer_id" },
        { status: 400 }
      );
    }

    // Verify admin has access to this farmer
    const adminRole = await verifyAdminAccess(request, farmer_id);
    if (!adminRole) {
      return NextResponse.json(
        { error: "Access denied: You do not have permission to modify this farm's products" },
        { status: 403 }
      );
    }

    // Get the correct farmer collection
    const collectionId = FARMER_COLLECTIONS[farmer_id];
    if (!collectionId) {
      return NextResponse.json(
        { error: "Invalid farmer_id" },
        { status: 400 }
      );
    }

    // Calculate final price
    const finalPrice = Math.round(
      fullPrice - (fullPrice * (discount || 0)) / 100
    );

    const databases = getServerAppwrite();
    const now = Math.floor(Date.now() / 1000);

    // Save to farmer-specific collection
    const newProduct = await databases.createDocument(
      DATABASE_ID,
      collectionId,
      "unique()",
      {
        name,
        variant: variant || "",
        fullPrice,
        discount: discount || 0,
        finalPrice,
        stock,
        description: description || "",
        images: JSON.stringify(images || []),
        createdAt: now,
        updatedAt: now,
      }
    );

    return NextResponse.json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
