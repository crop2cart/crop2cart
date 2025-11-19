import { NextRequest, NextResponse } from "next/server";
import { Query, Models } from "appwrite";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";

interface Order extends Models.Document {
  orderId: string;
  totalAmount: number;
  status: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: string;
  shippingAddress: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
  cancelledAt?: number;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const databases = getServerAppwrite();

    // Fetch orders for this user
    const response = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [Query.equal("userId", userId), Query.limit(100)]
    );

    const orders = ((response.documents || []) as Order[]).map((order) => ({
      $id: order.$id,
      orderId: order.orderId,
      items: typeof order.items === "string" ? order.items : JSON.stringify(order.items),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      cancelledAt: order.cancelledAt || null,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
