import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";
import { Query } from "appwrite";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  try {
    const databases = getServerAppwrite();

    // Fetch single order by document ID
    const orderResponse = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [Query.equal("$id", orderId)]
    );

    if (!orderResponse.documents || orderResponse.documents.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderResponse.documents[0];

    // Format the response
    const formattedOrder = {
      id: order.$id,
      orderId: order.orderId,
      userId: order.userId,
      userName: order.userName,
      userEmail: order.userEmail,
      items: order.items ? JSON.parse(order.items) : [],
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      phone: order.phone || "",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedOrder,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
