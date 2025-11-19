#!/usr/bin/env node

/**
 * Create Missing Appwrite Collections
 * - Products
 * - Orders  
 * - Farmers
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

async function createCollections() {
  try {
    console.log("🏗️  Creating Missing Appwrite Collections");
    console.log("=".repeat(60));

    // Create Products Collection
    console.log("\n📋 Creating 'products' collection...");
    try {
      const productsCollection = await makeRequest("POST", `/databases/${DATABASE_ID}/collections`, {
        collectionId: "products",
        name: "products",
        permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
      });
      console.log("✅ Products collection created");

      // Add products attributes
      const productAttributes = [
        { key: "name", type: "string", size: 255, required: true },
        { key: "variant", type: "string", size: 255, required: false }, // e.g., "2pcs", "1Kg", "500g"
        { key: "fullPrice", type: "integer", required: true }, // Original full price
        { key: "discount", type: "integer", required: false, default: 0 }, // Discount %
        { key: "finalPrice", type: "integer", required: true }, // Price after discount
        { key: "stock", type: "integer", required: true },
        { key: "description", type: "string", size: 2000, required: false },
        { key: "images", type: "string", size: 2000, required: false }, // JSON array of URLs
        { key: "rating", type: "double", required: false, default: 0 },
        { key: "createdAt", type: "integer", required: true },
        { key: "updatedAt", type: "integer", required: true },
      ];

      for (const attr of productAttributes) {
        try {
          if (attr.type === "integer") {
            await makeRequest("POST", `/databases/${DATABASE_ID}/collections/products/attributes/integer`, {
              key: attr.key,
              required: attr.required || false,
              default: attr.default,
            });
          } else if (attr.type === "double") {
            await makeRequest("POST", `/databases/${DATABASE_ID}/collections/products/attributes/double`, {
              key: attr.key,
              required: attr.required || false,
              default: attr.default,
            });
          } else {
            await makeRequest("POST", `/databases/${DATABASE_ID}/collections/products/attributes/string`, {
              key: attr.key,
              size: attr.size || 255,
              required: attr.required || false,
              default: attr.default,
            });
          }
          console.log(`  ✓ Attribute: ${attr.key}`);
        } catch (e) {
          if (!e.message.includes("already exists")) throw e;
        }
      }
    } catch (error) {
      if (!error.message.includes("already exists")) throw error;
      console.log("✅ Products collection already exists");
    }

    // Create Orders Collection
    console.log("\n📋 Creating 'orders' collection...");
    try {
      await makeRequest("POST", `/databases/${DATABASE_ID}/collections`, {
        collectionId: "orders",
        name: "orders",
        permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
      });
      console.log("✅ Orders collection created");

      const orderAttributes = [
        { key: "orderId", type: "string", size: 50, required: true },
        { key: "userId", type: "string", size: 255, required: true },
        { key: "userEmail", type: "string", size: 255, required: true },
        { key: "userName", type: "string", size: 255, required: true },
        { key: "items", type: "string", size: 5000, required: true }, // JSON array
        { key: "totalAmount", type: "integer", required: true },
        { key: "status", type: "string", size: 50, required: true }, // pending, processing, delivered, cancelled
        { key: "shippingAddress", type: "string", size: 1000, required: true },
        { key: "phone", type: "string", size: 20, required: false },
        { key: "createdAt", type: "integer", required: true },
        { key: "updatedAt", type: "integer", required: true },
      ];

      for (const attr of orderAttributes) {
        try {
          if (attr.type === "integer") {
            await makeRequest("POST", `/databases/${DATABASE_ID}/collections/orders/attributes/integer`, {
              key: attr.key,
              required: attr.required || false,
              default: attr.default,
            });
          } else {
            await makeRequest("POST", `/databases/${DATABASE_ID}/collections/orders/attributes/string`, {
              key: attr.key,
              size: attr.size || 255,
              required: attr.required || false,
              default: attr.default,
            });
          }
          console.log(`  ✓ Attribute: ${attr.key}`);
        } catch (e) {
          if (!e.message.includes("already exists")) throw e;
        }
      }
    } catch (error) {
      if (!error.message.includes("already exists")) throw error;
      console.log("✅ Orders collection already exists");
    }

    // Create Farmers Collection
    console.log("\n📋 Creating 'farmers' collection...");
    try {
      await makeRequest("POST", `/databases/${DATABASE_ID}/collections`, {
        collectionId: "farmers",
        name: "farmers",
        permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
      });
      console.log("✅ Farmers collection created");

      const farmerAttributes = [
        { key: "userId", type: "string", size: 255, required: true },
        { key: "email", type: "string", size: 255, required: true },
        { key: "name", type: "string", size: 255, required: true },
        { key: "farmName", type: "string", size: 255, required: true },
        { key: "areaName", type: "string", size: 255, required: false },
        { key: "state", type: "string", size: 100, required: false },
        { key: "address", type: "string", size: 1000, required: true },
        { key: "latitude", type: "string", size: 50, required: false }, // Store as string "28.6139"
        { key: "longitude", type: "string", size: 50, required: false }, // Store as string "77.2090"
        { key: "phone", type: "string", size: 20, required: false },
        { key: "avatar_url", type: "string", size: 1000, required: false },
        { key: "registrationDate", type: "integer", required: true },
      ];

      for (const attr of farmerAttributes) {
        try {
          if (attr.type === "integer") {
            await makeRequest("POST", `/databases/${DATABASE_ID}/collections/farmers/attributes/integer`, {
              key: attr.key,
              required: attr.required || false,
            });
          } else {
            await makeRequest("POST", `/databases/${DATABASE_ID}/collections/farmers/attributes/string`, {
              key: attr.key,
              size: attr.size || 255,
              required: attr.required || false,
            });
          }
          console.log(`  ✓ Attribute: ${attr.key}`);
        } catch (e) {
          if (!e.message.includes("already exists")) throw e;
        }
      }
    } catch (error) {
      if (!error.message.includes("already exists")) throw error;
      console.log("✅ Farmers collection already exists");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Collections Setup Complete!");
    console.log("=".repeat(60));
    console.log("\n📝 Next Steps:");
    console.log("1. Run: node scripts/seed-initial-data.js");
    console.log("2. This will populate products, farmers, and sample orders\n");

  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

createCollections();
