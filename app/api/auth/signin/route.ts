import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Initialize Appwrite database
    const databases = getServerAppwrite();

    // Query users collection by email
    let user;
    try {
      const dbResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [{ method: 'equal', attribute: 'email', value: email }]
      );

      if (dbResponse.documents.length === 0) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      user = dbResponse.documents[0];
    } catch (error) {
      console.error("Error querying user:", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Hash the provided password with PASSWORD_SALT
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + process.env.PASSWORD_SALT!)
      .digest("hex");

    // Compare hashed password
    if (hashedPassword !== user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
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

    // Return token and user data
    return NextResponse.json({
      token,
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Failed to sign in: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
