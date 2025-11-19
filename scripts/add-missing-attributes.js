#!/usr/bin/env node

/**
 * Add Missing Attributes to Collections
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

function makeRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${ENDPOINT}${urlPath}`);
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

async function addMissingAttributes() {
  try {
    console.log("🔧 Adding Missing Attributes");
    console.log("=".repeat(60));

    // Products missing attributes
    console.log("\n📦 Products Collection:");
    const productAttrs = [
      { key: "stock", type: "integer" },
      { key: "description", type: "string", size: 2000 },
      { key: "images", type: "string", size: 2000 },
      { key: "rating", type: "double" },
      { key: "createdAt", type: "integer" },
      { key: "updatedAt", type: "integer" },
    ];

    for (const attr of productAttrs) {
      try {
        if (attr.type === "integer") {
          await makeRequest("POST", `/databases/${DATABASE_ID}/collections/products/attributes/integer`, {
            key: attr.key,
            required: false,
          });
        } else if (attr.type === "double") {
          await makeRequest("POST", `/databases/${DATABASE_ID}/collections/products/attributes/double`, {
            key: attr.key,
            required: false,
          });
        } else {
          await makeRequest("POST", `/databases/${DATABASE_ID}/collections/products/attributes/string`, {
            key: attr.key,
            size: attr.size || 255,
            required: false,
          });
        }
        console.log(`  ✓ ${attr.key}`);
      } catch (e) {
        if (e.message.includes("already exists")) {
          console.log(`  ✓ ${attr.key} (exists)`);
        } else {
          console.log(`  ⚠️  ${attr.key}: ${e.message.substring(0, 40)}`);
        }
      }
    }

    // Farmers missing attributes
    console.log("\n👨‍🌾 Farmers Collection:");
    const farmerAttrs = [
      { key: "latitude", type: "string", size: 50 },
      { key: "longitude", type: "string", size: 50 },
      { key: "phone", type: "string", size: 20 },
      { key: "avatar_url", type: "string", size: 1000 },
      { key: "registrationDate", type: "integer" },
    ];

    for (const attr of farmerAttrs) {
      try {
        if (attr.type === "integer") {
          await makeRequest("POST", `/databases/${DATABASE_ID}/collections/farmers/attributes/integer`, {
            key: attr.key,
            required: false,
          });
        } else {
          await makeRequest("POST", `/databases/${DATABASE_ID}/collections/farmers/attributes/string`, {
            key: attr.key,
            size: attr.size || 255,
            required: false,
          });
        }
        console.log(`  ✓ ${attr.key}`);
      } catch (e) {
        if (e.message.includes("already exists")) {
          console.log(`  ✓ ${attr.key} (exists)`);
        } else {
          console.log(`  ⚠️  ${attr.key}: ${e.message.substring(0, 40)}`);
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Done! Now run seed script again\n");
  } catch (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }
}

addMissingAttributes();
