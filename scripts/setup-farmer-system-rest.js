/**
 * Farmer System Setup Script - Using REST API
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

async function apiCall(method, path, body = null) {
  // Remove /v1 from endpoint if present, then add full path
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
  console.log('\n🌾 FARMER SYSTEM SETUP (REST API)\n');

  try {
    // Phase 1: Check existing products
    console.log('📊 Phase 1: Checking existing products...');
    const productsResponse = await apiCall('GET', `/v1/databases/${databaseId}/collections/products/documents`);
    console.log(`✅ Found ${productsResponse.documents.length} products`);
    
    if (productsResponse.documents.length === 0) {
      console.error('❌ No products found. Please add products first.');
      return;
    }

    // Phase 2: Check if farmers collection exists
    console.log('\n📊 Phase 2: Checking if farmers collection exists...');
    let farmersExists = false;
    
    try {
      const collectionsResponse = await apiCall('GET', `/v1/databases/${databaseId}/collections`);
      farmersExists = collectionsResponse.collections.some(c => c.$id === 'farmers');
      console.log(farmersExists ? '✅ Farmers collection exists' : 'ℹ️ Creating farmers collection...');
    } catch (e) {
      console.log('ℹ️ Will create farmers collection');
    }

    // Phase 3: Create farmers collection if needed
    if (!farmersExists) {
      console.log('\n🔧 Phase 3: Creating farmers collection...');
      try {
        await apiCall('POST', `/v1/databases/${databaseId}/collections`, {
          collectionId: 'farmers',
          name: 'Farmers',
          permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
          documentSecurity: false,
        });
        console.log('✅ Created farmers collection');

        // Wait for collection to be ready
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Add attributes
        console.log('   Adding attributes...');
        const attributes = [
          { key: 'name', type: 'string', required: true, size: 256 },
          { key: 'email', type: 'string', required: true, size: 256 },
          { key: 'location', type: 'string', required: true, size: 256 },
          { key: 'area', type: 'string', required: true, size: 256 },
          { key: 'description', type: 'string', required: false, size: 1000 },
        ];

        for (const attr of attributes) {
          try {
            await apiCall('POST', `/v1/databases/${databaseId}/collections/farmers/attributes/string`, {
              key: attr.key,
              required: attr.required,
              size: attr.size,
            });
            console.log(`   ✅ Added ${attr.key} attribute`);
          } catch (e) {
            if (e.message.includes('exists')) {
              console.log(`   ℹ️ ${attr.key} already exists`);
            } else {
              throw e;
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.error('❌ Failed to create collection:', e.message);
        throw e;
      }
    }

    // Phase 4: Add farmer data
    console.log('\n🔧 Phase 4: Adding farmer data...');
    const farmerIds = [];
    
    for (const farmer of farmers) {
      try {
        const response = await apiCall('POST', `/v1/databases/${databaseId}/collections/farmers/documents`, {
          documentId: 'unique()',
          data: farmer,
        });
        farmerIds.push(response.$id);
        console.log(`✅ Created farmer: ${farmer.name} (ID: ${response.$id})`);
      } catch (e) {
        console.error(`❌ Failed to create farmer: ${farmer.name}`, e.message);
        throw e;
      }
    }

    // Phase 5: Update products with farmer assignments
    console.log('\n🔧 Phase 5: Assigning products to farmers...');
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
          await apiCall('PATCH', `/v1/databases/${databaseId}/collections/products/documents/${product.$id}`, {
            farmer_id: farmerId,
            farmer_name: farmerName,
          });
          console.log(`   ✅ Product ${productIndex + 1}: ${product.name} → ${farmerName}`);
          productIndex++;
        } catch (e) {
          console.error(`   ❌ Failed to update product:`, e.message);
        }
      }
    }

    console.log('\n✨ SETUP COMPLETE!\n');
    console.log('📋 Farmer IDs and Assignments:');
    let idx = 0;
    for (const dist of distributions) {
      console.log(`   ${farmers[idx].name}: ${farmerIds[idx]} (${dist.count} products)`);
      idx++;
    }

    console.log('\n📝 Save this farmer data for frontend:\n');
    console.log('const FARMERS = [');
    farmers.forEach((f, i) => {
      console.log(`  {`);
      console.log(`    id: '${farmerIds[i]}',`);
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
