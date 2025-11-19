import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing credentials", url: !!url, key: !!serviceRoleKey },
      { status: 400 }
    );
  }

  try {
    // Try direct API call to Supabase
    const response = await fetch(`${url}/rest/v1/users?limit=1`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      data,
      keyLength: serviceRoleKey.length,
      keyParts: serviceRoleKey.split(".").length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
