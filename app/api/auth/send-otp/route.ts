import { getServerAppwrite, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import nodemailer from "nodemailer";

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Appwrite with 10 minute expiry (using Unix timestamps)
    const now = new Date();
    const nowUnix = Math.floor(now.getTime() / 1000);
    const expiresUnix = nowUnix + (10 * 60); // 10 minutes
    
    const databases = getServerAppwrite();
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SIGNUP_OTP_TOKENS,
        ID.unique(),
        {
          email,
          otp,
          expires_at: expiresUnix,
          used: false,
          created_at: nowUnix,
          updated_at: nowUnix,
          verified_at: null,
          password: "",
          name: "",
        }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return Response.json(
        { error: "Failed to generate OTP" },
        { status: 500 }
      );
    }

    // Send OTP email via Gmail SMTP
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your Crop2Cart Login Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">Welcome to Crop2Cart</h2>
            <p>Your one-time login code is:</p>
            <h1 style="color: #22c55e; letter-spacing: 5px; font-size: 32px; margin: 20px 0;">
              ${otp}
            </h1>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      return Response.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "OTP sent to email" },
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
