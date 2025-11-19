// scripts/check-products-schema.js
// Check Appwrite products collection schema using REST API

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !databaseId || !apiKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint + path);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const protocol = url.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function checkProductsSchema() {
  try {
    console.log("\n📦 CHECKING PRODUCTS COLLECTION SCHEMA\n");

    // Get collection metadata
    const collection = await makeRequest(
      `/v1/databases/${databaseId}/collections/products`
    );
    
    console.log("✅ Collection found: products\n");
    
    // Debug: show what we got
    console.log("📋 RAW COLLECTION RESPONSE:");
    console.log(JSON.stringify(collection, null, 2).slice(0, 500));
    console.log("\n");

    console.log("📋 SCHEMA ATTRIBUTES:");
    if (collection.attributes && Array.isArray(collection.attributes)) {
      collection.attributes.forEach((attr, idx) => {
        console.log(`  ${idx + 1}. ${attr.key}`);
        console.log(`     Type: ${attr.type}`);
        if (attr.required) console.log(`     Required: YES`);
        if (attr.array) console.log(`     Array: YES`);
        console.log();
      });
    } else {
      console.log("  No attributes found in response");
    }

    // List existing products
    console.log("\n📊 CHECKING EXISTING PRODUCTS:\n");
    const productsResponse = await makeRequest(
      `/v1/databases/${databaseId}/collections/products/documents`
    );

    console.log("📋 RAW PRODUCTS RESPONSE:");
    console.log(JSON.stringify(productsResponse, null, 2).slice(0, 800));
    console.log("\n");

    console.log(`Total products: ${productsResponse.total}\n`);

    if (productsResponse.total > 0) {
      console.log("🔍 FIRST 3 PRODUCTS:");
      productsResponse.documents.slice(0, 3).forEach((product, idx) => {
        console.log(`\n  Product ${idx + 1}:`);
        console.log(`    ID: ${product.$id}`);
        console.log(`    Name: ${product.name || "N/A"}`);
        console.log(`    Farmer ID: ${product.farmer_id || "NOT SET"}`);
        console.log(`    Has images: ${product.images ? "YES" : "NO"}`);
        console.log(`    Price: ${product.finalPrice || "N/A"}`);
      });

      // Count products by farmer_id
      console.log("\n\n📈 PRODUCTS BY FARMER:");
      const byFarmer = {};
      productsResponse.documents.forEach((product) => {
        const farmerId = product.farmer_id || "NO_FARMER";
        byFarmer[farmerId] = (byFarmer[farmerId] || 0) + 1;
      });

      Object.entries(byFarmer).forEach(([farmerId, count]) => {
        console.log(`  ${farmerId}: ${count} products`);
      });
    }

    console.log("\n\n✅ SCHEMA CHECK COMPLETE\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkProductsSchema();
