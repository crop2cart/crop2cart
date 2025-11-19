import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";

// Query the admin_roles collection to find farmer_id for email
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { error: "No email provided in headers" },
        { status: 400 }
      );
    }

    const databases = getServerAppwrite();

    // Query admin_roles collection for this email
    // Collection ID: 691d988b0bc5d591f336
    const response = await databases.listDocuments(
      DATABASE_ID,
      "691d988b0bc5d591f336", // admin_roles collection
      [
        {
          method: "equal",
          attribute: "email",
          value: email,
        },
      ]
    );

    if (response.documents.length === 0) {
      return NextResponse.json(
        { error: "Admin role not found for this email" },
        { status: 404 }
      );
    }

    const adminRole = response.documents[0];

    return NextResponse.json({
      success: true,
      data: {
        email: adminRole.email,
        farmer_id: adminRole.farmer_id,
        farm_name: adminRole.farm_name,
      },
    });
  } catch (error) {
    console.error("Error fetching admin role:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin role" },
      { status: 500 }
    );
  }
}
