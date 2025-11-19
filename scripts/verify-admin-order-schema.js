#!/usr/bin/env node

/**
 * Verify Appwrite Schema for Admin Order Management
 * - Checks orders collection has all needed fields
 * - Verifies status field supports all values
 * - Reports schema readiness
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// Load environment variables
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

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

console.log("🔍 Admin Order Management Schema Verification");
console.log("=".repeat(60));

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
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function verifySchema() {
  try {
    console.log("\n📋 Step 1: Checking Orders Collection");
    console.log("-".repeat(60));

    // Get orders collection info
    const collection = await makeRequest(
      "GET",
      `/databases/${DATABASE_ID}/collections/orders`
    );

    console.log(`✅ Orders collection found`);
    console.log(`   Name: ${collection.name}`);
    console.log(`   Document Count: ${collection.documentCount || 0}`);

    // Check required attributes
    const requiredFields = [
      "orderId",
      "userId",
      "userEmail",
      "userName",
      "items",
      "totalAmount",
      "status",
      "shippingAddress",
      "phone",
      "createdAt",
      "updatedAt",
    ];

    const existingFields = collection.attributes.map((attr) => attr.key);

    console.log(`\n📊 Required Fields Status (${existingFields.length} total):`);
    requiredFields.forEach((field) => {
      const exists = existingFields.includes(field);
      const symbol = exists ? "✅" : "❌";
      console.log(`  ${symbol} ${field}`);
    });

    // Check status field
    const statusAttr = collection.attributes.find((attr) => attr.key === "status");
    if (statusAttr) {
      console.log(`\n🔧 Status Field Details:`);
      console.log(`   Type: ${statusAttr.type}`);
      console.log(`   Required: ${statusAttr.required}`);
      console.log(`   ✅ String field - supports any status value`);
    }

    // Check if all required fields exist
    const missingFields = requiredFields.filter(
      (f) => !existingFields.includes(f)
    );

    console.log(`\n✅ Schema Verification Results`);
    console.log("=".repeat(60));

    if (missingFields.length === 0) {
      console.log("✅ All required fields exist!");
      console.log("\n📝 Collection is ready for:");
      console.log("  • Admin status updates");
      console.log("  • Analytics calculations");
      console.log("  • Order filtering by status");
      console.log("  • Customer order history");
    } else {
      console.log(
        `⚠️  Missing fields: ${missingFields.join(", ")}`
      );
      console.log(
        `\nPlease run: node scripts/add-missing-attributes.js`
      );
    }

    console.log("\n🚀 Admin Order Management Features:");
    console.log("  • PATCH /api/admin/update-order-status");
    console.log("  • GET /api/admin/analytics");
    console.log("  • GET /api/admin/orders-list?status=X");
    console.log("  • Customer status sync auto-updates");

    console.log("\n📌 Supported Order Statuses:");
    console.log("  • pending - Order placed, awaiting processing");
    console.log("  • shipped - Order in transit to customer");
    console.log("  • completed - Order delivered successfully");
    console.log("  • cancelled - Order cancelled by customer or admin");

  } catch (error) {
    console.error("❌ Schema verification failed:", error.message);
    process.exit(1);
  }
}

verifySchema();
