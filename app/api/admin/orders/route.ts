import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";

export async function GET(request: NextRequest) {
  try {
    const databases = getServerAppwrite();

    // Fetch all orders from Appwrite
    const response = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [
        { method: "orderDesc", attribute: "createdAt" },
        { method: "limit", value: 100 },
      ]
    );

    const orders = response.documents.map((doc: any) => ({
      id: doc.$id,
      orderId: doc.orderId,
      userId: doc.userId,
      userEmail: doc.userEmail,
      userName: doc.userName,
      items: doc.items ? JSON.parse(doc.items) : [],
      totalAmount: doc.totalAmount,
      status: doc.status,
      shippingAddress: doc.shippingAddress,
      phone: doc.phone || "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
