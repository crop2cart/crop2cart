import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";
import { verifyAdminAccess, FARMER_COLLECTIONS } from "@/app/api/admin/verify-access";

export async function PATCH(request: NextRequest) {
  try {
    const { id, name, variant, fullPrice, discount, stock, description, images, farmer_id } =
      await request.json();

    // Validate required fields
    if (!id || !farmer_id) {
      return NextResponse.json(
        { error: "Missing required fields: id, farmer_id" },
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

    // Calculate final price if provided
    let finalPrice;
    if (fullPrice !== undefined) {
      finalPrice = Math.round(
        fullPrice - (fullPrice * (discount || 0)) / 100
      );
    }

    const databases = getServerAppwrite();
    const now = Math.floor(Date.now() / 1000);

    // Build update data object
    const updateData: any = {
      updatedAt: now,
    };

    if (name !== undefined) updateData.name = name;
    if (variant !== undefined) updateData.variant = variant;
    if (fullPrice !== undefined) updateData.fullPrice = fullPrice;
    if (discount !== undefined) updateData.discount = discount;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (stock !== undefined) updateData.stock = stock;
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = JSON.stringify(images || []);

    // Update the document
    const updatedProduct = await databases.updateDocument(
      DATABASE_ID,
      collectionId,
      id,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
