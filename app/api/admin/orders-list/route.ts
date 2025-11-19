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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "all", "pending", "cancelled", "completed", "shipped"

    // Fetch orders
    let response;
    
    if (status && status !== "all") {
      response = await databases.listDocuments(
        DATABASE_ID,
        "orders",
        [Query.equal("status", status), Query.limit(100)]
      );
    } else {
      response = await databases.listDocuments(
        DATABASE_ID,
        "orders",
        [Query.limit(100)]
      );
    }

    const orders = ((response.documents || []) as Order[]).map((order) => ({
      $id: order.$id,
      orderId: order.orderId,
      userId: order.userId,
      userEmail: order.userEmail,
      userName: order.userName,
      items: typeof order.items === "string" ? order.items : JSON.stringify(order.items),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      cancelledAt: order.cancelledAt || null,
    }));

    console.log(`[ADMIN] Fetched ${orders.length} orders with status: ${status || "all"} by admin: ${userEmail}`);

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
