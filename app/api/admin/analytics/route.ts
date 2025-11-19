import { NextRequest, NextResponse } from "next/server";
import { Query, Models } from "appwrite";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  shippedOrders: number;
  averageOrderValue: number;
}

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
    // Check if user is admin
    const userEmail = request.headers.get("x-admin-email");
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const databases = getServerAppwrite();

    // Fetch all orders with limit of 100
    const response = await databases.listDocuments(
      DATABASE_ID,
      "orders",
      [Query.limit(100)]
    );

    const orders = (response.documents || []) as Order[];

    // Calculate analytics
    const analytics: OrderAnalytics = {
      totalOrders: orders.length,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      shippedOrders: 0,
      averageOrderValue: 0,
    };

    orders.forEach((order: Order) => {
      analytics.totalRevenue += order.totalAmount || 0;

      switch (order.status) {
        case "pending":
          analytics.pendingOrders++;
          break;
        case "completed":
          analytics.completedOrders++;
          break;
        case "cancelled":
          analytics.cancelledOrders++;
          break;
        case "shipped":
          analytics.shippedOrders++;
          break;
      }
    });

    if (analytics.totalOrders > 0) {
      analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
    }

    console.log(`[ANALYTICS] Fetched analytics for admin: ${userEmail}`);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
