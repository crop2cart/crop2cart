import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const envVars = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing",
      passwordSalt: process.env.PASSWORD_SALT ? "✓ Set" : "✗ Missing",
      jwtSecret: process.env.JWT_SECRET ? "✓ Set" : "✗ Missing",
      resendKey: process.env.RESEND_API_KEY ? "✓ Set" : "✗ Missing",
    };

    // Try to decode the service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const keyParts = serviceRoleKey.split(".");
    
    return NextResponse.json({
      message: "Environment Check",
      envVars,
      serviceRoleKeyInfo: {
        length: serviceRoleKey.length,
        parts: keyParts.length,
        firstPart: keyParts[0]?.substring(0, 20) + "...",
        lastPart: "..." + keyParts[2]?.substring(keyParts[2].length - 20),
        hasQuote: serviceRoleKey.includes('"'),
        hasApostrophe: serviceRoleKey.includes("'"),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
