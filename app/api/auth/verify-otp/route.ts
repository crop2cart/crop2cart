import { getServerAppwrite, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return Response.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Initialize Appwrite database
    const databases = getServerAppwrite();

    // Query OTP tokens from Appwrite
    let otpRecord;
    try {
      const now = new Date();
      const currentUnix = Math.floor(now.getTime() / 1000);

      const dbResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SIGNUP_OTP_TOKENS,
        [
          { method: 'equal', attribute: 'email', value: email },
          { method: 'equal', attribute: 'otp', value: otp },
          { method: 'equal', attribute: 'used', value: false },
          { method: 'greaterThan', attribute: 'expires_at', value: currentUnix },
          { method: 'orderDesc', attribute: 'created_at' },
          { method: 'limit', value: 1 },
        ]
      );

      if (dbResponse.documents.length === 0) {
        return Response.json(
          { error: "Invalid or expired OTP" },
          { status: 401 }
        );
      }

      otpRecord = dbResponse.documents[0];
    } catch (error) {
      console.error("Error querying OTP:", error);
      return Response.json(
        { error: "Failed to verify OTP" },
        { status: 500 }
      );
    }

    // Mark OTP as used
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SIGNUP_OTP_TOKENS,
        otpRecord.$id,
        { used: true, verified_at: Math.floor(new Date().getTime() / 1000) }
      );
    } catch (error) {
      console.error("Error updating OTP:", error);
      return Response.json(
        { error: "Failed to verify OTP" },
        { status: 500 }
      );
    }

    // Check if user exists, if not create new user
    let user;
    try {
      const userResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [{ method: 'equal', attribute: 'email', value: email }, { method: 'limit', value: 1 }]
      );

      if (userResponse.documents.length === 0) {
        // User doesn't exist, create new user
        const now = Math.floor(new Date().getTime() / 1000);
        try {
          user = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            crypto.randomUUID(),
            {
              email,
              name: "",
              password: "",
              phone: "",
              avatar_url: "",
              status: "active",
              created_at: now,
              updated_at: now,
              last_login: now,
            }
          );
        } catch (error) {
          console.error("Error creating user:", error);
          return Response.json(
            { error: "Failed to create user" },
            { status: 500 }
          );
        }
      } else {
        user = userResponse.documents[0];
      }
    } catch (error) {
      console.error("Error checking user:", error);
      return Response.json(
        { error: "Failed to check user" },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return Response.json(
      {
        success: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
