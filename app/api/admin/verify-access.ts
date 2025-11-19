import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID } from "@/lib/appwrite";

// Farmer collection mapping
export const FARMER_COLLECTIONS: Record<string, string> = {
  '691d71728aae9e02a5a7': 'yakoge_products',
  '691d7173228d6f9d54a0': 'greenvalley_products',
  '691d7173bc793e81f6e0': 'freshharvest_products'
};

interface AdminRole {
  email: string;
  farmer_id: string;
  farm_name: string;
}

/**
 * Verify that the admin has access to the given farmer_id
 * Returns the admin role if authorized, or null if not
 */
export async function verifyAdminAccess(
  request: NextRequest,
  requiredFarmerId?: string
): Promise<AdminRole | null> {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      console.error("[Auth] No email provided");
      return null;
    }

    const databases = getServerAppwrite();

    // Query admin_roles collection for this email
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
      console.error(`[Auth] No role found for email: ${email}`);
      return null;
    }

    const adminRole = response.documents[0];
    const assignedFarmerId = adminRole.farmer_id;

    // If a specific farmer_id is required, verify access
    if (requiredFarmerId && assignedFarmerId !== requiredFarmerId) {
      console.error(
        `[Auth] Access denied: ${email} assigned to ${assignedFarmerId}, tried to access ${requiredFarmerId}`
      );
      return null;
    }

    return {
      email: adminRole.email,
      farmer_id: adminRole.farmer_id,
      farm_name: adminRole.farm_name,
    };
  } catch (error) {
    console.error("[Auth] Error during verification:", error);
    return null;
  }
}
