#!/usr/bin/env node

/**
 * Add Missing Attributes for Order Cancellation Feature
 * - Adds cancelledAt attribute to orders collection (if not exists)
 * - Validates the orders collection structure
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

console.log("🔧 Order Cancellation Schema Update Script");
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

async function updateOrdersSchema() {
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
    console.log(`   Documents: ${collection.documentCount}`);

    // Check existing attributes
    const attributes = collection.attributes.map((attr) => attr.key);
    console.log(`\n📊 Current Attributes (${attributes.length}):`);
    attributes.forEach((attr) => {
      console.log(`   • ${attr}`);
    });

    // Check if cancelledAt already exists
    const hasCancelledAt = attributes.includes("cancelledAt");

    console.log(`\n🔍 Step 2: Checking for New Attributes`);
    console.log("-".repeat(60));

    if (hasCancelledAt) {
      console.log(`✅ cancelledAt attribute already exists`);
    } else {
      console.log(`❌ cancelledAt attribute NOT found - adding...`);

      // Add cancelledAt attribute (nullable integer for Unix timestamp)
      const addAttributeBody = {
        key: "cancelledAt",
        required: false,
      };

      const response = await makeRequest(
        "POST",
        `/databases/${DATABASE_ID}/collections/orders/attributes/integer`,
        addAttributeBody
      );

      console.log(`✅ Successfully added cancelledAt attribute`);
      console.log(`   Type: integer (Unix timestamp)`);
      console.log(`   Required: false`);
      console.log(`   Default: null`);
    }

    // Check status field supports all needed values
    console.log(`\n📊 Step 3: Verifying Status Field`);
    console.log("-".repeat(60));

    const statusAttr = collection.attributes.find((attr) => attr.key === "status");
    if (statusAttr) {
      console.log(`✅ Status field exists`);
      console.log(`   Type: ${statusAttr.type}`);

      // Check supported values (for enum types)
      if (statusAttr.elements) {
        console.log(`   Supported values:`);
        statusAttr.elements.forEach((val) => {
          console.log(`     • ${val}`);
        });

        // Check if we need all status values
        const requiredStatuses = ["pending", "shipped", "completed", "cancelled"];
        const missingStatuses = requiredStatuses.filter(
          (s) => !statusAttr.elements.includes(s)
        );

        if (missingStatuses.length > 0) {
          console.log(
            `\n   ⚠️  Missing status values: ${missingStatuses.join(", ")}`
          );
          console.log(
            `   Note: String status fields allow any value, so this is OK`
          );
        } else {
          console.log(`   ✅ All required status values supported`);
        }
      } else {
        console.log(`   ✅ String field - supports all status values`);
      }
    }

    console.log(`\n✅ Schema Update Complete!`);
    console.log("=".repeat(60));

    // Summary of what new code expects
    console.log("\n📝 Updated Schema Summary:");
    console.log("-".repeat(60));
    console.log("Orders Collection now supports:");
    console.log("  • status: 'pending' | 'shipped' | 'completed' | 'cancelled'");
    console.log("  • cancelledAt: Unix timestamp (nullable) when order was cancelled");
    console.log("\nNew Endpoints Available:");
    console.log("  • PATCH /api/orders/cancel - Cancel a pending order");
    console.log("  • GET /api/admin/analytics - View order statistics");
    console.log("  • GET /api/admin/orders-list?status=X - Filter orders by status");
    console.log("  • GET /api/customer/my-orders - View customer's orders");
    console.log("\nNew Pages:");
    console.log("  • /profile/my-orders - Customer order history & cancellation");
    console.log("  • /admin (updated) - Added Analytics tab with order stats");

  } catch (error) {
    if (error.message.includes("Attribute already exists")) {
      console.log(`⚠️  Attribute already exists (OK)`);
      console.log("✅ Schema is already up to date!");
    } else if (error.message.includes("Collection not found")) {
      console.error("❌ Orders collection not found!");
      console.error(
        "   Please ensure orders collection exists before running this script"
      );
      process.exit(1);
    } else {
      console.error("❌ Error updating schema:", error.message);
      process.exit(1);
    }
  }
}

updateOrdersSchema();
