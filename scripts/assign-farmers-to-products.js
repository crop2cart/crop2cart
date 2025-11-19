/**
 * Simpler Farmer System Setup - Add farmer data directly to products
 */

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

// Farmer data
const farmers = [
  {
    id: 'farmer_raj_organic',
    name: 'Raj\'s Organic Farm',
    email: 'yakoge2234@gusronk.com',
    location: 'Mumbai, Maharashtra',
    area: '2.3 km away',
  },
  {
    id: 'farmer_green_valley',
    name: 'Green Valley Farms',
    email: 'vineethkumar45677@gmail.com',
    location: 'Thane, Maharashtra',
    area: '5.8 km away',
  },
  {
    id: 'farmer_fresh_harvest',
    name: 'Fresh Harvest Co.',
    email: 'vineethedits01@gmail.com',
    location: 'Navi Mumbai, Maharashtra',
    area: '8.2 km away',
  }
];

async function apiCall(method, path, body = null) {
  const baseUrl = endpoint.replace('/v1', '');
  const url = `${baseUrl}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Key': apiKey,
      'X-Appwrite-Project': projectId,
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`${response.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('\n🌾 FARMER SYSTEM SETUP - Products Assignment\n');

  try {
    // Get existing products
    console.log('📊 Phase 1: Fetching existing products...');
    const productsResponse = await apiCall('GET', `/v1/databases/${databaseId}/collections/products/documents`);
    console.log(`✅ Found ${productsResponse.documents.length} products\n`);
    
    if (productsResponse.documents.length === 0) {
      console.error('❌ No products found.');
      return;
    }

    // Assignment strategy
    const distributions = [
      { farmerIdx: 0, count: 12, farmerData: farmers[0] },
      { farmerIdx: 1, count: 13, farmerData: farmers[1] },
      { farmerIdx: 2, count: 15, farmerData: farmers[2] },
    ];

    console.log('🔧 Phase 2: Assigning products to farmers...');
    console.log('Distribution: 12 → Raj\'s, 13 → Green Valley, 15 → Fresh Harvest\n');

    let productIndex = 0;
    let successCount = 0;

    for (const dist of distributions) {
      const farmer = dist.farmerData;
      
      for (let i = 0; i < dist.count && productIndex < productsResponse.documents.length; i++) {
        const product = productsResponse.documents[productIndex];
        
        try {
          await apiCall('PATCH', `/v1/databases/${databaseId}/collections/products/documents/${product.$id}`, {
            farmer_id: farmer.id,
            farmer_name: farmer.name,
            farmer_email: farmer.email,
            farmer_location: farmer.location,
            farmer_area: farmer.area,
          });
          console.log(`✅ Product ${productIndex + 1} → ${farmer.name}`);
          productIndex++;
          successCount++;
        } catch (e) {
          console.error(`❌ Product ${productIndex + 1}: ${e.message}`);
          productIndex++;
        }
      }
    }

    console.log(`\n✨ SETUP COMPLETE!\n`);
    console.log(`📊 Updated ${successCount}/${productsResponse.documents.length} products`);
    console.log('\n📋 Farmer Configuration:\n');
    farmers.forEach(f => {
      console.log(`${f.name}`);
      console.log(`  ID: ${f.id}`);
      console.log(`  Email: ${f.email}`);
      console.log(`  Location: ${f.location}`);
      console.log(`  Area: ${f.area}\n`);
    });

    console.log('📝 Use this in frontend:\n');
    console.log('const FARMERS = [');
    farmers.forEach(f => {
      console.log(`  {`);
      console.log(`    id: '${f.id}',`);
      console.log(`    name: '${f.name}',`);
      console.log(`    location: '${f.location}',`);
      console.log(`    area: '${f.area}',`);
      console.log(`  },`);
    });
    console.log('];\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
