// scripts/assign-farmers-batch.js
// Batch assign products to farmers using fetch

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
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

const FARMER_IDS = [
  '691d71728aae9e02a5a7',  // Yakoge
  '691d7173228d6f9d54a0',  // Green Valley
  '691d7173bc793e81f6e0',  // Fresh Harvest
];

const FARMER_NAMES = ['Yakoge', 'Green Valley', 'Fresh Harvest'];

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function main() {
  console.log('\n🎯 BATCH ASSIGNING PRODUCTS TO FARMERS\n');

  try {
    // Get all products
    console.log('1️⃣  Fetching products...');
    const { status, data } = await fetchJSON(
      `${ENDPOINT}/v1/databases/${DATABASE_ID}/collections/products/documents`
    );

    if (status !== 200) {
      console.error('❌ Failed to fetch products:', data);
      return;
    }

    const products = data.documents;
    console.log(`✅ Found ${products.length} products\n`);

    // Assign to farmers
    const productsPerFarmer = Math.ceil(products.length / FARMER_IDS.length);
    console.log(`📊 Plan: ${productsPerFarmer} products per farmer\n`);
    console.log('📋 ASSIGNING:\n');

    let successCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmerIdx = Math.floor(i / productsPerFarmer) % FARMER_IDS.length;
      const farmerId = FARMER_IDS[farmerIdx];
      const farmerName = FARMER_NAMES[farmerIdx];

      process.stdout.write(`   ${String(i + 1).padStart(2)}/15 ${product.name.padEnd(15)} → ${farmerName.padEnd(15)} `);

      const url = `${ENDPOINT}/v1/databases/${DATABASE_ID}/collections/products/documents/${product.$id}`;
      const { status: updateStatus, data: updateData } = await fetchJSON(url, {
        method: 'PATCH',
        body: JSON.stringify({ farmer_id: farmerId }),
      });

      if (updateStatus === 200 && updateData.farmer_id === farmerId) {
        console.log('✅');
        successCount++;
      } else {
        console.log('❌');
        if (updateData.message) {
          console.log(`      ${updateData.message}`);
        }
      }
    }

    console.log(`\n✨ Successfully assigned ${successCount}/${products.length} products\n`);

    // Verify
    console.log('📈 VERIFICATION:\n');
    const { data: verifyData } = await fetchJSON(
      `${ENDPOINT}/v1/databases/${DATABASE_ID}/collections/products/documents`
    );

    const byFarmer = { [FARMER_IDS[0]]: 0, [FARMER_IDS[1]]: 0, [FARMER_IDS[2]]: 0 };
    verifyData.documents.forEach(p => {
      if (p.farmer_id && byFarmer.hasOwnProperty(p.farmer_id)) {
        byFarmer[p.farmer_id]++;
      }
    });

    FARMER_IDS.forEach((id, idx) => {
      console.log(`   ${FARMER_NAMES[idx]}: ${byFarmer[id]} products`);
    });

    console.log('\n✨ COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
