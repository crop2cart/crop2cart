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

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is admin
    const userEmail = request.headers.get("x-admin-email");
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const databases = getServerAppwrite();

    // Find the order by orderId
    const response = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [Query.equal("orderId", orderId), Query.limit(1)]
    );

    if (!response.documents || response.documents.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = (response.documents[0] as unknown as Order);

    // Update order status
    const now = Math.floor(Date.now() / 1000);
    const updatedOrder = await databases.updateDocument(
      DATABASE_ID,
      "orders",
      order.$id,
      {
        status: status,
        updatedAt: now,
      }
    );

    console.log(
      `[ADMIN] Order ${orderId} status updated to "${status}" by admin: ${userEmail}`
    );

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
