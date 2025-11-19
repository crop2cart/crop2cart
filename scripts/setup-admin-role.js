#!/usr/bin/env node

/**
 * Setup Admin Role System in Appwrite
 * - Adds 'role' and 'isAdmin' attributes to users collection
 * - Configures admin email whitelist
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local manually
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  });
}

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Admin email list (also configure in .env.local)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((email) => email.trim())
  : ["admin@crop2cart.com"];

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error("❌ Missing environment variables");
  console.error("Required: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY, NEXT_PUBLIC_APPWRITE_DATABASE_ID");
  process.exit(1);
}

console.log("🔧 Admin Role Setup Script");
console.log("=".repeat(50));
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`Project ID: ${PROJECT_ID}`);
console.log(`Database ID: ${DATABASE_ID}`);
console.log(`Admin Emails: ${ADMIN_EMAILS.join(", ")}`);
console.log("=".repeat(50));

// Helper function for API calls
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${ENDPOINT}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID,
        "X-Appwrite-Key": API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function setupAdminRole() {
  try {
    console.log("\n📋 Step 1: Adding 'role' attribute to users collection...");
    try {
      await makeRequest("POST", `/databases/${DATABASE_ID}/collections/users/attributes/string`, {
        key: "role",
        size: 100,
        required: false,
        default: "user",
      });
      console.log("✅ 'role' attribute created successfully");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("✅ 'role' attribute already exists");
      } else {
        throw error;
      }
    }

    console.log("\n📋 Step 2: Adding 'isAdmin' attribute to users collection...");
    try {
      await makeRequest("POST", `/databases/${DATABASE_ID}/collections/users/attributes/boolean`, {
        key: "isAdmin",
        required: false,
        default: false,
      });
      console.log("✅ 'isAdmin' attribute created successfully");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("✅ 'isAdmin' attribute already exists");
      } else {
        throw error;
      }
    }

    console.log("\n📋 Step 3: Updating existing users with admin roles...");
    try {
      const usersResponse = await makeRequest(
        "GET",
        `/databases/${DATABASE_ID}/collections/users/documents?limit=1000`
      );

      console.log(`Found ${usersResponse.documents.length} existing users`);

      for (const user of usersResponse.documents) {
        const isAdminEmail = ADMIN_EMAILS.includes(user.email);
        const shouldUpdate =
          user.role !== (isAdminEmail ? "admin" : "user") ||
          user.isAdmin !== isAdminEmail;

        if (shouldUpdate) {
          await makeRequest(
            "PATCH",
            `/databases/${DATABASE_ID}/collections/users/documents/${user.$id}`,
            {
              role: isAdminEmail ? "admin" : "user",
              isAdmin: isAdminEmail,
            }
          );

          console.log(
            `  ✅ Updated: ${user.email} → role: ${
              isAdminEmail ? "admin" : "user"
            }`
          );
        }
      }
    } catch (error) {
      console.log(
        `⚠️  Note: Could not batch update users (${error.message})`
      );
      console.log("   Users will be updated as they sign in next time");
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Admin Role Setup Complete!");
    console.log("=".repeat(50));
    console.log("\n📝 Next Steps:");
    console.log("1. Add ADMIN_EMAILS to .env.local:");
    console.log(`   ADMIN_EMAILS=${ADMIN_EMAILS.join(",")}`);
    console.log("2. Update User interface in AuthContext.tsx");
    console.log("3. Update verify-signup-otp route to set role");
    console.log("4. Update signin route to return role");
    console.log("5. Create admin route protection\n");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setupAdminRole();
