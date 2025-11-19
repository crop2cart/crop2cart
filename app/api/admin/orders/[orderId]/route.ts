import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { broadcastOrderUpdate } from "@/lib/sse-broadcast";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  try {
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["pending", "processing", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const databases = getServerAppwrite();
    const now = Math.floor(Date.now() / 1000);

    const updatedOrder = await databases.updateDocument(
      DATABASE_ID,
      "orders",
      orderId,
      {
        status,
        updatedAt: now,
      }
    );

    // Broadcast the status update to connected clients
    const userId = (updatedOrder as any).userId;
    const orderIdDoc = (updatedOrder as any).orderId;
    broadcastOrderUpdate(orderIdDoc, userId, status);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  try {
    const databases = getServerAppwrite();

    const order = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [Query.equal("$id", orderId)]
    );

    if (!order.documents || order.documents.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const orderData = order.documents[0];

    return NextResponse.json({
      success: true,
      data: {
        id: orderData.$id,
        orderId: orderData.orderId,
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        userName: orderData.userName,
        items: orderData.items ? JSON.parse(orderData.items) : [],
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        shippingAddress: orderData.shippingAddress,
        phone: orderData.phone || "",
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
