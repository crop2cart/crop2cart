// scripts/bulk-update-farmer-ids.js
// Bulk update products with farmer IDs using proven HTTP method

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.replace('/v1', '');
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const FARMER_IDS = [
  '691d71728aae9e02a5a7',  // Yakoge
  '691d7173228d6f9d54a0',  // Green Valley
  '691d7173bc793e81f6e0',  // Fresh Harvest
];

const FARMER_NAMES = ['Yakoge', 'Green Valley', 'Fresh Harvest'];

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint + path);
    const protocol = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  try {
    console.log('\n🎯 BULK UPDATING PRODUCTS WITH FARMER IDS\n');

    // Get products
    console.log('1️⃣  Fetching all products...');
    const { status: getStatus, data: productsData } = await makeRequest(
      `/v1/databases/${databaseId}/collections/products/documents`
    );

    if (getStatus !== 200) {
      console.error('❌ Error fetching products:', productsData);
      return;
    }

    const products = productsData.documents;
    console.log(`✅ Found ${products.length} products\n`);

    // Plan assignment
    const productsPerFarmer = Math.ceil(products.length / FARMER_IDS.length);
    console.log(`📊 PLAN:`);
    console.log(`   Products per farmer: ${productsPerFarmer}\n`);

    // Perform updates
    console.log('📋 UPDATING PRODUCTS:\n');
    let updated = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmerIdx = Math.floor(i / productsPerFarmer) % FARMER_IDS.length;
      const farmerId = FARMER_IDS[farmerIdx];
      const farmerName = FARMER_NAMES[farmerIdx];

      process.stdout.write(
        `   ${String(i + 1).padStart(2)}/15 ${product.name.padEnd(16)} → ${farmerName.padEnd(14)} `
      );

      // Prepare full product data with new farmer_id
      const updateData = {
        farmer_id: farmerId,
        name: product.name,
        variant: product.variant || '',
        fullPrice: product.fullPrice,
        discount: product.discount || 0,
        finalPrice: product.finalPrice,
        stock: product.stock || 0,
        description: product.description || '',
        images: product.images || '[]',
        createdAt: product.createdAt,
        updatedAt: Math.floor(Date.now() / 1000),
      };

      const { status: patchStatus, data: patchResult } = await makeRequest(
        `/v1/databases/${databaseId}/collections/products/documents/${product.$id}`,
        'PATCH',
        updateData
      );

      if (patchStatus === 200 && patchResult.farmer_id === farmerId) {
        console.log('✅');
        updated++;
      } else {
        console.log('❌');
        if (patchResult.message) {
          console.log(`      Error: ${patchResult.message.substring(0, 80)}`);
        }
      }
    }

    console.log(`\n✨ Updated ${updated}/${products.length} products\n`);

    // Verify
    console.log('📈 VERIFICATION:\n');
    const { data: verifyData } = await makeRequest(
      `/v1/databases/${databaseId}/collections/products/documents`
    );

    const byFarmer = {};
    verifyData.documents.forEach(p => {
      const fid = p.farmer_id || 'NONE';
      byFarmer[fid] = (byFarmer[fid] || 0) + 1;
    });

    console.log('   Summary by farmer:');
    FARMER_IDS.forEach((id, idx) => {
      console.log(`   ${FARMER_NAMES[idx]}: ${byFarmer[id] || 0} products`);
    });
    if (byFarmer.NONE) {
      console.log(`   NOT ASSIGNED: ${byFarmer.NONE} products`);
    }

    console.log('\n✨ COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
