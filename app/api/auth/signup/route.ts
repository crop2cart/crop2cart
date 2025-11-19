import { NextRequest, NextResponse } from "next/server";
import { getServerAppwrite, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";
// @ts-ignore
import nodemailer from "nodemailer";
import crypto from "crypto";

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Initialize Appwrite database
    const databases = getServerAppwrite();

    // Check if user already exists
    try {
      const existingUsers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [{ method: 'equal', attribute: 'email', value: email }]
      );

      if (existingUsers.documents.length > 0) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + process.env.PASSWORD_SALT!)
      .digest("hex");

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database using UNIX timestamps
    const now = new Date();
    const nowUnix = Math.floor(now.getTime() / 1000);
    const expiresUnix = nowUnix + (10 * 60); // 10 minutes

    console.log("OTP Generated:", otp);
    console.log("Created at (Unix):", nowUnix);
    console.log("Expires at (Unix):", expiresUnix);

    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SIGNUP_OTP_TOKENS,
        ID.unique(),
        {
          email,
          otp,
          password: hashedPassword,
          name,
          created_at: nowUnix,
          expires_at: expiresUnix,
          updated_at: nowUnix,
          used: false,
        }
      );
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Send OTP via Gmail SMTP
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Verify Your Crop2Cart Account - OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to Crop2Cart!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Fresh Produce Directly from Farmers</p>
            </div>
            
            <p>Hi ${name},</p>
            
            <p>Thank you for signing up with Crop2Cart. To complete your account setup, please verify your email with the code below:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Your verification code:</p>
              <h2 style="margin: 0; font-size: 42px; letter-spacing: 8px; color: #10b981; font-family: monospace;">${otp}</h2>
              <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">This code expires in 10 minutes</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">If you didn't create this account, please ignore this email or contact support.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="text-align: center; color: #999; font-size: 12px;">
              Crop2Cart - Your trusted source for farm-fresh produce<br>
              <a href="http://localhost:3002" style="color: #10b981; text-decoration: none;">Visit Crop2Cart</a>
            </p>
          </div>
        `,
        text: `Welcome to Crop2Cart!\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't create this account, please ignore this email.`,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      return NextResponse.json(
        { 
          error: "Failed to send verification email. Please check that Gmail is properly configured.",
          details: emailError instanceof Error ? emailError.message : String(emailError)
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Account created. OTP sent to your email.",
      email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
