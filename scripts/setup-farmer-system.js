/**
 * Farmer System Setup Script
 * Using Appwrite SDK
 */

const { Client, Databases, Query, ID } = require('appwrite');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
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

console.log('Endpoint:', endpoint);
console.log('ProjectId:', projectId);
console.log('DatabaseId:', databaseId);
console.log('ApiKey:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET');

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

// For server-side with API key
const databases = new Databases(client);

// Farmer data
const farmers = [
  {
    name: 'Raj\'s Organic Farm',
    email: 'yakoge2234@gusronk.com',
    location: 'Mumbai, Maharashtra',
    area: '2.3 km away',
    description: 'Certified organic farming with premium produce'
  },
  {
    name: 'Green Valley Farms',
    email: 'vineethkumar45677@gmail.com',
    location: 'Thane, Maharashtra',
    area: '5.8 km away',
    description: 'Fresh vegetables and fruits daily'
  },
  {
    name: 'Fresh Harvest Co.',
    email: 'vineethedits01@gmail.com',
    location: 'Navi Mumbai, Maharashtra',
    area: '8.2 km away',
    description: 'Premium quality farm-to-table produce'
  }
];

async function main() {
  console.log('\n🌾 FARMER SYSTEM SETUP\n');

  try {
    // Phase 1: Check existing products
    console.log('📊 Phase 1: Checking existing products...');
    const productsResponse = await databases.listDocuments(databaseId, 'products');
    console.log(`✅ Found ${productsResponse.documents.length} products`);
    
    if (productsResponse.documents.length === 0) {
      console.error('❌ No products found. Please add products first.');
      return;
    }

    // Log sample product structure
    console.log('\n📋 Sample Product Structure:');
    const sampleProduct = productsResponse.documents[0];
    console.log(JSON.stringify(sampleProduct, null, 2).substring(0, 500));

    // Phase 2: Check if farmers collection exists
    console.log('\n📊 Phase 2: Checking if farmers collection exists...');
    let farmersDocs = null;
    
    try {
      farmersDocs = await databases.listDocuments(databaseId, 'farmers');
      console.log(`✅ Farmers collection exists with ${farmersDocs.documents.length} farmers`);
    } catch (e) {
      console.log('ℹ️ Farmers collection does not exist, will create documents directly');
    }

    // Phase 3: Add/Update farmer data
    console.log('\n🔧 Phase 3: Adding farmer data...');
    const farmerIds = [];
    
    for (const farmer of farmers) {
      try {
        const farmerDoc = await databases.createDocument(
          databaseId,
          'farmers',
          ID.unique(),
          farmer
        );
        farmerIds.push(farmerDoc.$id);
        console.log(`✅ Created farmer: ${farmer.name} (ID: ${farmerDoc.$id})`);
      } catch (e) {
        console.error(`❌ Failed to create farmer: ${farmer.name}`, e.message);
      }
    }

    // Phase 4: Update products with farmer assignments
    console.log('\n🔧 Phase 4: Assigning products to farmers...');
    console.log('   Distribution: 12 items → Farmer 1, 13 items → Farmer 2, 15 items → Farmer 3');

    const distributions = [
      { farmerIdx: 0, count: 12 },
      { farmerIdx: 1, count: 13 },
      { farmerIdx: 2, count: 15 },
    ];

    let productIndex = 0;
    for (const dist of distributions) {
      const farmerId = farmerIds[dist.farmerIdx];
      const farmerName = farmers[dist.farmerIdx].name;
      
      for (let i = 0; i < dist.count && productIndex < productsResponse.documents.length; i++) {
        const product = productsResponse.documents[productIndex];
        
        try {
          await databases.updateDocument(databaseId, 'products', product.$id, {
            farmer_id: farmerId,
            farmer_name: farmerName,
          });
          console.log(`   ✅ Product ${productIndex + 1}: ${product.name || 'Unknown'} → ${farmerName}`);
          productIndex++;
        } catch (e) {
          console.error(`   ❌ Failed to update product:`, e.message);
        }
      }
    }

    console.log('\n✨ SETUP COMPLETE!\n');
    console.log('📋 Farmer IDs and Assignments:');
    farmerIds.forEach((id, idx) => {
      const dist = distributions[idx];
      console.log(`   ${farmers[idx].name}: ${id} (${dist.count} products)`);
    });

    console.log('\n📝 Next Steps:');
    console.log('   1. Update /app/home/page.tsx to use farmer filter');
    console.log('   2. Update product fetching to filter by farmer_id');
    console.log('   3. Test farmer selection on home page\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
