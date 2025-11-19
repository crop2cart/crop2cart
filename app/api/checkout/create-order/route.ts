import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID, ID } from "@/lib/appwrite";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Check authentication headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to place an order." },
        { status: 401 }
      );
    }

    const {
      userId: bodyUserId,
      userEmail: bodyUserEmail,
      userName,
      items,
      totalAmount,
      shippingAddress,
      phone,
    } = await request.json();

    // Verify userId matches between header and body
    if (bodyUserId !== userId || bodyUserEmail !== userEmail) {
      return NextResponse.json(
        { error: "User ID mismatch. Unauthorized request." },
        { status: 401 }
      );
    }

    // Validate required fields
    if (
      !userId ||
      !userEmail ||
      !userName ||
      !items ||
      !totalAmount ||
      !shippingAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const databases = getServerAppwrite();
    const now = Math.floor(Date.now() / 1000);

    // Generate order ID
    const orderId =
      "ORD-" + Date.now().toString().slice(-6) + crypto.randomBytes(2).toString("hex").toUpperCase();

    const newOrder = await databases.createDocument(
      DATABASE_ID,
      "orders",
      ID.unique(),
      {
        orderId,
        userId, // Now guaranteed to be authenticated user ID
        userEmail,
        userName,
        items: JSON.stringify(items),
        totalAmount,
        status: "pending",
        shippingAddress,
        phone: phone || "",
        createdAt: now,
        updatedAt: now,
      }
    );

    console.log(`[CHECKOUT] Order ${orderId} created by authenticated user: ${userEmail}`);

    return NextResponse.json({
      success: true,
      data: {
        id: newOrder.$id,
        orderId: newOrder.orderId,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
