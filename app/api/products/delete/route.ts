import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";
import { verifyAdminAccess, FARMER_COLLECTIONS } from "@/app/api/admin/verify-access";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");
    const farmerId = searchParams.get("farmer_id");

    if (!productId || !farmerId) {
      return NextResponse.json(
        { error: "Missing query parameters: id, farmer_id" },
        { status: 400 }
      );
    }

    // Verify admin has access to this farmer
    const adminRole = await verifyAdminAccess(request, farmerId);
    if (!adminRole) {
      return NextResponse.json(
        { error: "Access denied: You do not have permission to modify this farm's products" },
        { status: 403 }
      );
    }

    // Get the correct farmer collection
    const collectionId = FARMER_COLLECTIONS[farmerId];
    if (!collectionId) {
      return NextResponse.json(
        { error: "Invalid farmer_id" },
        { status: 400 }
      );
    }

    const databases = getServerAppwrite();

    // Delete the product
    await databases.deleteDocument(DATABASE_ID, collectionId, productId);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
