import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";
import { Query } from "appwrite";

export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const databases = getServerAppwrite();

    // Fetch orders for this customer filtered by userId
    const ordersResponse = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(100),
      ]
    );

    if (!ordersResponse.documents) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    // Format the response
    const formattedOrders = ordersResponse.documents.map((order: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      total: ordersResponse.total,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
