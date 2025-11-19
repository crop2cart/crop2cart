import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Initialize Appwrite
    const databases = getServerAppwrite();

    // Verify OTP
    const otpResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SIGNUP_OTP_TOKENS,
      [
        { method: 'equal', attribute: 'email', value: email },
        { method: 'equal', attribute: 'otp', value: otp },
        { method: 'equal', attribute: 'used', value: false },
        { method: 'orderDesc', attribute: 'created_at' },
        { method: 'limit', value: 1 },
      ]
    );
    const otpRecords = otpResponse.documents;

    console.log("OTP lookup - Email:", email, "OTP:", otp);
    console.log("OTP records found:", otpRecords?.length);

    if (!otpRecords || otpRecords.length === 0) {
      console.error("No matching OTP record found");
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    // Check if expired (using Unix timestamp comparison - direct number comparison)
    const now = new Date();
    const currentUnix = Math.floor(now.getTime() / 1000); // Current time in seconds
    const expiryUnix = otpRecord.expires_at; // Already a Unix timestamp (number)
    
    console.log("Current time (Unix):", currentUnix, "Date:", new Date(currentUnix * 1000).toISOString());
    console.log("Expiry time (Unix):", expiryUnix, "Date:", new Date(expiryUnix * 1000).toISOString());
    console.log("Expired?", currentUnix > expiryUnix);
    console.log("Time remaining (seconds):", expiryUnix - currentUnix);

    if (currentUnix > expiryUnix) {
      console.error("OTP expired");
      return NextResponse.json(
        { error: "OTP has expired" },
        { status: 400 }
      );
    }

    // Mark OTP as used with verified_at timestamp
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SIGNUP_OTP_TOKENS,
        otpRecord.$id,
        { 
          used: true, 
          verified_at: currentUnix // Store when verification happened
        }
      );
    } catch (updateError) {
      console.error("Failed to mark OTP as used:", updateError);
      return NextResponse.json(
        { error: "Failed to verify OTP" },
        { status: 500 }
      );
    }

    // Create user in users table
    let newUser;
    try {
      const now = Math.floor(new Date().getTime() / 1000);
      
      // Check if user email is an admin email
      const adminEmails = (process.env.ADMIN_EMAILS || 'admin@crop2cart.com')
        .split(',')
        .map(e => e.trim());
      const isAdminEmail = adminEmails.includes(email);
      
      newUser = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          email,
          password: otpRecord.password,
          name: otpRecord.name,
          role: isAdminEmail ? 'admin' : 'user',
          isAdmin: isAdminEmail,
          created_at: now,
          updated_at: now,
        }
      );
    } catch (createError) {
      console.error("User creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser.$id, email: newUser.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Account verified successfully",
      token,
      user: {
        id: newUser.$id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role || 'user',
        isAdmin: newUser.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("Verify signup error:", error);
    return NextResponse.json(
      { error: "Failed to verify signup: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
