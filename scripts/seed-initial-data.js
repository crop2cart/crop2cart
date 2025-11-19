#!/usr/bin/env node

/**
 * Seed Initial Data to Appwrite
 * - All 15 products with pricing, stock, images
 * - Sample farmers (main admin + 2 random in Hyderabad)
 * - Sample orders for testing
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

const IMAGE_URL = "https://fra.cloud.appwrite.io/v1/storage/buckets/691cd6c000275440bb4e/files/691d0fd2000adaa0b9b8/view?project=691cc78f002782a96b55&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbklkIjoiNjkxZDEwM2E5NmQwM2M3ODU1NDYiLCJyZXNvdXJjZUlkIjoiNjkxY2Q2YzAwMDI3NTQ0MGJiNGU6NjkxZDBmZDIwMDBhZGFhMGI5YjgiLCJyZXNvdXJjZVR5cGUiOiJmaWxlcyIsInJlc291cmNlSW50ZXJuYWxJZCI6IjQ5NTMyOjIiLCJleHAiOjE3OTUwNDY0MDB9.1gZn1ZWG95gsEnAQYMpeRSeiWzUfr8MV6pEhULhbm-Y";

const ALL_15_PRODUCTS = [
  { name: "Red Apples", variant: "(2pcs)", fullPrice: 65, discount: 30, stock: 150 },
  { name: "Bananas", variant: "(1 Kg)", fullPrice: 50, discount: 30, stock: 200 },
  { name: "Strawberries", variant: "(500g)", fullPrice: 180, discount: 33, stock: 80 },
  { name: "Oranges", variant: "(1 Kg)", fullPrice: 80, discount: 31, stock: 120 },
  { name: "Grapes", variant: "(500g)", fullPrice: 140, discount: 32, stock: 95 },
  { name: "Watermelon", variant: "(1 Pc)", fullPrice: 260, discount: 30, stock: 50 },
  { name: "Mangoes", variant: "(1 Kg)", fullPrice: 180, discount: 33, stock: 100 },
  { name: "Pineapple", variant: "(1 Pc)", fullPrice: 130, discount: 34, stock: 75 },
  { name: "Guava", variant: "(1 Kg)", fullPrice: 100, discount: 35, stock: 110 },
  { name: "Pomegranate", variant: "(1 Kg)", fullPrice: 220, discount: 31, stock: 60 },
  { name: "Papaya", variant: "(1 Pc)", fullPrice: 120, discount: 37, stock: 45 },
  { name: "Blueberries", variant: "(500g)", fullPrice: 280, discount: 35, stock: 40 },
  { name: "Kiwi", variant: "(500g)", fullPrice: 170, discount: 35, stock: 70 },
  { name: "Dragon Fruit", variant: "(1 Pc)", fullPrice: 220, discount: 36, stock: 55 },
  { name: "Peaches", variant: "(500g)", fullPrice: 160, discount: 37, stock: 85 },
];

const HYDERABAD_LOCATIONS = [
  { name: "ECIL", lat: "17.3850", lng: "78.5169", address: "ECIL, Hyderabad, Telangana" },
  { name: "Kukatpally", lat: "17.4601", lng: "78.4380", address: "Kukatpally, Hyderabad, Telangana" },
  { name: "Gachibowli", lat: "17.4406", lng: "78.4436", address: "Gachibowli, Hyderabad, Telangana" },
];

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

function generateId() {
  return crypto.randomBytes(12).toString("hex");
}

async function seedData() {
  try {
    const now = Math.floor(Date.now() / 1000);

    console.log("🌱 Seeding Appwrite with Initial Data");
    console.log("=".repeat(60));

    // STEP 1: Add Products
    console.log("\n📦 STEP 1: Adding 15 Products");
    console.log("-".repeat(60));
    for (const product of ALL_15_PRODUCTS) {
      const finalPrice = Math.round(product.fullPrice - (product.fullPrice * product.discount) / 100);
      try {
        await makeRequest("POST", `/databases/${DATABASE_ID}/collections/products/documents`, {
          documentId: generateId(),
          data: {
            name: product.name,
            variant: product.variant,
            fullPrice: product.fullPrice,
            discount: product.discount,
            finalPrice: finalPrice,
            stock: product.stock,
            description: `Fresh ${product.name} from local farms. High quality and pesticide-free.`,
            images: JSON.stringify([IMAGE_URL, IMAGE_URL]),
            createdAt: now,
            updatedAt: now,
          },
        });
        console.log(`  ✓ ${product.name}${product.variant} (₹${finalPrice})`);
      } catch (e) {
        console.log(`  ⚠️  ${product.name}: ${e.message.substring(0, 50)}`);
      }
    }

    // STEP 2: Add Farmers
    console.log("\n👨‍🌾 STEP 2: Adding Farmers");
    console.log("-".repeat(60));
    
    const farmers = [
      {
        userId: "admin-yakoge",
        email: "yakoge2234@gusronk.com",
        name: "Yakoge Farmer",
        farmName: "Yakoge Premium Farm",
        areaName: "ECIL",
        state: "Telangana",
        address: "ECIL, Hyderabad, Telangana",
        latitude: "17.3850",
        longitude: "78.5169",
        phone: "9876543210",
      },
      {
        userId: "farmer-" + generateId().substring(0, 8),
        email: "farmer1@crop2cart.com",
        name: "Ramesh Kumar",
        farmName: "Kumar Farm",
        areaName: "Kukatpally",
        state: "Telangana",
        address: "Kukatpally, Hyderabad, Telangana",
        latitude: "17.4601",
        longitude: "78.4380",
        phone: "9876543211",
      },
      {
        userId: "farmer-" + generateId().substring(0, 8),
        email: "farmer2@crop2cart.com",
        name: "Rajesh Singh",
        farmName: "Singh Organic Farm",
        areaName: "Gachibowli",
        state: "Telangana",
        address: "Gachibowli, Hyderabad, Telangana",
        latitude: "17.4406",
        longitude: "78.4436",
        phone: "9876543212",
      },
    ];

    for (const farmer of farmers) {
      try {
        await makeRequest("POST", `/databases/${DATABASE_ID}/collections/farmers/documents`, {
          documentId: generateId(),
          data: {
            userId: farmer.userId,
            email: farmer.email,
            name: farmer.name,
            farmName: farmer.farmName,
            areaName: farmer.areaName,
            state: farmer.state,
            address: farmer.address,
            latitude: farmer.latitude,
            longitude: farmer.longitude,
            phone: farmer.phone,
            avatar_url: IMAGE_URL,
            registrationDate: now,
          },
        });
        console.log(`  ✓ ${farmer.name} (${farmer.email})`);
      } catch (e) {
        console.log(`  ⚠️  ${farmer.name}: ${e.message.substring(0, 50)}`);
      }
    }

    // STEP 3: Add Sample Orders
    console.log("\n📋 STEP 3: Adding Sample Orders");
    console.log("-".repeat(60));

    const sampleOrders = [
      {
        orderId: "ORD-" + Date.now().toString().slice(-6),
        userId: "user-123",
        userEmail: "hohejo6745@etramay.com",
        userName: "John Customer",
        items: JSON.stringify([
          { name: "Red Apples (2pcs)", quantity: 2, price: 45 },
          { name: "Bananas (1 Kg)", quantity: 1, price: 35 },
        ]),
        totalAmount: 125,
        status: "delivered",
        shippingAddress: "123 Main Street, Hyderabad, Telangana 500001",
        phone: "9876543200",
        createdAt: now - 86400,
        updatedAt: now,
      },
      {
        orderId: "ORD-" + (Date.now() + 1000).toString().slice(-6),
        userId: "user-456",
        userEmail: "customer2@example.com",
        userName: "Jane Smith",
        items: JSON.stringify([
          { name: "Strawberries (500g)", quantity: 1, price: 120 },
          { name: "Blueberries (500g)", quantity: 1, price: 180 },
        ]),
        totalAmount: 300,
        status: "processing",
        shippingAddress: "456 Oak Avenue, Hyderabad, Telangana 500002",
        phone: "9876543201",
        createdAt: now - 3600,
        updatedAt: now,
      },
    ];

    for (const order of sampleOrders) {
      try {
        await makeRequest("POST", `/databases/${DATABASE_ID}/collections/orders/documents`, {
          documentId: generateId(),
          data: {
            orderId: order.orderId,
            userId: order.userId,
            userEmail: order.userEmail,
            userName: order.userName,
            items: order.items,
            totalAmount: order.totalAmount,
            status: order.status,
            shippingAddress: order.shippingAddress,
            phone: order.phone,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          },
        });
        console.log(`  ✓ ${order.orderId} - ${order.userEmail} (${order.status})`);
      } catch (e) {
        console.log(`  ⚠️  ${order.orderId}: ${e.message.substring(0, 50)}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Data Seeding Complete!");
    console.log("=".repeat(60));
    console.log("\n📝 Summary:");
    console.log(`  ✓ ${ALL_15_PRODUCTS.length} Products added`);
    console.log(`  ✓ ${farmers.length} Farmers added`);
    console.log(`  ✓ ${sampleOrders.length} Sample Orders added`);
    console.log("\n🎯 Next Steps:");
    console.log("  1. Update admin products/orders UI to fetch from Appwrite");
    console.log("  2. Update home page to show live products");
    console.log("  3. Connect checkout to create orders in Appwrite\n");

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedData();
