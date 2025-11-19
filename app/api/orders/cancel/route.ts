import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const databases = getServerAppwrite();

    // First, find the order by orderId
    const response = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [
        {
          attribute: "orderId",
          values: [orderId],
        },
      ]
    );

    if (!response.documents || response.documents.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = response.documents[0];

    // Verify that the user is the owner of this order
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized. You can only cancel your own orders." },
        { status: 403 }
      );
    }

    // Check if order is already cancelled or completed
    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    if (order.status === "completed" || order.status === "shipped") {
      return NextResponse.json(
        { error: "Cannot cancel completed or shipped orders" },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const now = Math.floor(Date.now() / 1000);
    const updatedOrder = await databases.updateDocument(
      DATABASE_ID,
      "orders",
      order.$id,
      {
        data: {
          status: "cancelled",
          cancelledAt: now,
          updatedAt: now,
        }
      }
    );

    console.log(`[ORDERS] Order ${orderId} cancelled by user: ${userEmail}`);

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
