#!/usr/bin/env node
// scripts/setup-farmer-products.js
// Create separate product collections for each farmer

const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const ENDPOINT = env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const API_KEY = env.APPWRITE_API_KEY;

const FARMERS = [
  { id: '691d71728aae9e02a5a7', name: 'Yakoge Premium Farm', collectionId: 'yakoge_products' },
  { id: '691d7173228d6f9d54a0', name: 'Green Valley Farms', collectionId: 'greenvalley_products' },
  { id: '691d7173bc793e81f6e0', name: 'Fresh Harvest Co.', collectionId: 'freshharvest_products' }
];

async function apiRequest(method, path, data = null) {
  const url = `${ENDPOINT}${path}`;
  const options = {
    method,
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { ok: response.ok, status: response.status, data: result };
  } catch (error) {
    return { ok: false, status: 0, error: error.message };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🌾 SETTING UP FARMER-SPECIFIC PRODUCT COLLECTIONS');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Fetch all existing products
    console.log('📊 Fetching existing products from main collection...');
    const productsResp = await apiRequest('GET', `/databases/${DATABASE_ID}/collections/products/documents?limit=100`);
    
    if (!productsResp.ok) {
      console.error('❌ Failed to fetch products:', productsResp.data);
      return;
    }

    const products = productsResp.data.documents || [];
    console.log(`✓ Found ${products.length} products\n`);

    // Step 2: Create collections for each farmer
    for (const farmer of FARMERS) {
      console.log(`📋 Processing ${farmer.name}...`);

      // Check if collection exists
      const checkResp = await apiRequest('GET', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}`);
      
      if (checkResp.ok) {
        console.log(`  ✓ Collection already exists`);
      } else {
        // Create collection
        console.log(`  📦 Creating collection...`);
        const createResp = await apiRequest('POST', `/databases/${DATABASE_ID}/collections`, {
          collectionId: farmer.collectionId,
          name: `${farmer.name} Products`,
        });

        if (createResp.ok) {
          console.log(`  ✓ Created collection`);
        } else {
          console.error(`  ✗ Failed to create collection:`, createResp.data);
          continue;
        }

        // Add attributes
        console.log(`  📝 Adding attributes...`);
        const stringAttrs = [
          { key: 'name', size: 256 },
          { key: 'variant', size: 256 },
          { key: 'description', size: 1024 },
          { key: 'images', size: 2048 },
        ];

        for (const attr of stringAttrs) {
          await apiRequest('POST', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}/attributes/string`, {
            key: attr.key,
            size: attr.size,
            required: attr.key === 'name' ? true : false,
          });
        }

        const intAttrs = [
          { key: 'fullPrice', required: true },
          { key: 'discount', required: false },
          { key: 'finalPrice', required: true },
          { key: 'stock', required: false },
          { key: 'createdAt', required: false },
          { key: 'updatedAt', required: false },
        ];

        for (const attr of intAttrs) {
          await apiRequest('POST', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}/attributes/integer`, {
            key: attr.key,
            required: attr.required,
          });
        }
      }

      // Copy products to farmer's collection
      console.log(`  📦 Copying ${products.length} products...`);
      let copied = 0;
      let failed = 0;

      for (const product of products) {
        const productData = {
          name: product.name,
          variant: product.variant || '',
          fullPrice: product.fullPrice,
          discount: product.discount || 0,
          finalPrice: product.finalPrice,
          stock: product.stock || 0,
          description: product.description || '',
          images: product.images || '',
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        };

        const copyResp = await apiRequest('POST', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}/documents`, {
          documentId: 'unique()',
          data: productData,
        });

        if (copyResp.ok) {
          copied++;
        } else {
          failed++;
        }
      }

      console.log(`  ✓ Copied ${copied}/${products.length} products\n`);
    }

    console.log('='.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\nCreated collections:');
    FARMERS.forEach(f => console.log(`  • ${f.collectionId} (${f.name})`));
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
