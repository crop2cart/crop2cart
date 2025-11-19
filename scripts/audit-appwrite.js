#!/usr/bin/env node

/**
 * Comprehensive Appwrite Audit & Setup Script
 * - Checks existing collections & storage
 * - Verifies bucket ID
 * - Reports what needs to be created
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
const BUCKET_ID = "691cd6c000275440bb4e";

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

console.log("🔍 Appwrite Audit & Setup Script");
console.log("=".repeat(60));
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`Project ID: ${PROJECT_ID}`);
console.log(`Database ID: ${DATABASE_ID}`);
console.log(`Bucket ID: ${BUCKET_ID}`);
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function auditAppwrite() {
  try {
    console.log("\n📋 STEP 1: Checking Existing Collections");
    console.log("-".repeat(60));

    const collectionsResponse = await makeRequest(
      "GET",
      `/databases/${DATABASE_ID}/collections`
    );

    const collections = collectionsResponse.collections || [];
    const existingCollections = collections.map(c => c.name);

    console.log(`Found ${collections.length} collections:`);
    collections.forEach(c => {
      console.log(`  ✓ ${c.name} (ID: ${c.$id})`);
    });

    const requiredCollections = [
      { name: "users", exists: existingCollections.includes("users") },
      { name: "products", exists: existingCollections.includes("products") },
      { name: "orders", exists: existingCollections.includes("orders") },
      { name: "farmers", exists: existingCollections.includes("farmers") },
      { name: "signup_otp_tokens", exists: existingCollections.includes("signup_otp_tokens") },
    ];

    console.log("\n📊 Collection Status:");
    requiredCollections.forEach(c => {
      const status = c.exists ? "✅" : "❌";
      console.log(`  ${status} ${c.name}`);
    });

    console.log("\n🪣 STEP 2: Checking Storage Bucket");
    console.log("-".repeat(60));

    try {
      const bucketResponse = await makeRequest(
        "GET",
        `/storage/buckets/${BUCKET_ID}`
      );
      console.log(`✅ Bucket exists: ${bucketResponse.name}`);
      console.log(`   ID: ${bucketResponse.$id}`);
      console.log(`   Max file size: ${bucketResponse.maxFileSize} bytes`);
    } catch (error) {
      console.log(`❌ Bucket not found: ${BUCKET_ID}`);
      console.log(`   Error: ${error.message}`);
    }

    console.log("\n📝 STEP 3: Sample Collection Structures");
    console.log("-".repeat(60));

    // Check users collection attributes
    if (existingCollections.includes("users")) {
      const usersCollection = collections.find(c => c.name === "users");
      console.log("\n👥 Users Collection Attributes:");
      usersCollection.attributes.forEach(attr => {
        console.log(`  • ${attr.key} (${attr.type})`);
      });
    }

    // Check if products exists
    if (existingCollections.includes("products")) {
      const productsCollection = collections.find(c => c.name === "products");
      console.log("\n📦 Products Collection Attributes:");
      productsCollection.attributes.forEach(attr => {
        console.log(`  • ${attr.key} (${attr.type})`);
      });

      // Get sample product count
      const productsResponse = await makeRequest(
        "GET",
        `/databases/${DATABASE_ID}/collections/products/documents?limit=5`
      );
      console.log(`\n   Sample Products: ${productsResponse.documents.length}`);
      if (productsResponse.documents.length > 0) {
        console.log(`   First product: ${productsResponse.documents[0].name}`);
      }
    }

    // Check if orders exists
    if (existingCollections.includes("orders")) {
      const ordersCollection = collections.find(c => c.name === "orders");
      console.log("\n📋 Orders Collection Attributes:");
      ordersCollection.attributes.forEach(attr => {
        console.log(`  • ${attr.key} (${attr.type})`);
      });

      const ordersResponse = await makeRequest(
        "GET",
        `/databases/${DATABASE_ID}/collections/orders/documents?limit=5`
      );
      console.log(`\n   Sample Orders: ${ordersResponse.documents.length}`);
    }

    // Check if farmers exists
    if (existingCollections.includes("farmers")) {
      const farmersCollection = collections.find(c => c.name === "farmers");
      console.log("\n👨‍🌾 Farmers Collection Attributes:");
      farmersCollection.attributes.forEach(attr => {
        console.log(`  • ${attr.key} (${attr.type})`);
      });

      const farmersResponse = await makeRequest(
        "GET",
        `/databases/${DATABASE_ID}/collections/farmers/documents?limit=5`
      );
      console.log(`\n   Sample Farmers: ${farmersResponse.documents.length}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Audit Complete!");
    console.log("=".repeat(60));

    console.log("\n📝 NEXT STEPS:");
    const missing = requiredCollections.filter(c => !c.exists).map(c => c.name);
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing Collections: ${missing.join(", ")}`);
      console.log("\nRun: node scripts/create-collections.js");
    } else {
      console.log("\n✅ All required collections exist!");
    }

  } catch (error) {
    console.error("❌ Audit failed:", error.message);
    process.exit(1);
  }
}

auditAppwrite();
