// scripts/assign-products-to-farmers.js
// Assign existing products to farmers

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

// Farmer IDs from Appwrite
const FARMER_IDS = {
  yakoge: '691d71728aae9e02a5a7',           // Yakoge Premium Farm
  greenValley: '691d7173228d6f9d54a0',      // Green Valley Farms
  freshHarvest: '691d7173bc793e81f6e0',     // Fresh Harvest Co.
};

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

async function assignProductsToFarmers() {
  try {
    console.log('\n🎯 ASSIGNING EXISTING PRODUCTS TO FARMERS\n');

    // Fetch all products
    console.log('1️⃣  Fetching all products from Appwrite...');
    const { status: getStatus, data: productsData } = await makeRequest(
      `/v1/databases/${databaseId}/collections/products/documents`
    );

    if (getStatus !== 200) {
      console.error('❌ Error fetching products:', productsData);
      return;
    }

    const products = productsData.documents;
    console.log(`✅ Found ${products.length} products\n`);

    // Distribution: assign products evenly to 3 farmers
    const farmersList = Object.values(FARMER_IDS);
    const productsPerFarmer = Math.ceil(products.length / farmersList.length);
    
    console.log('📊 ASSIGNMENT PLAN:');
    console.log(`   Total products: ${products.length}`);
    console.log(`   Total farmers: ${farmersList.length}`);
    console.log(`   Products per farmer: ${productsPerFarmer}\n`);

    console.log('📋 DISTRIBUTION:');
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmerIndex = Math.floor(i / productsPerFarmer) % farmersList.length;
      const farmerId = farmersList[farmerIndex];
      
      const farmerName = Object.entries(FARMER_IDS).find(([_, id]) => id === farmerId)?.[0] || 'unknown';
      
      process.stdout.write(`   ${i + 1}/${products.length} - ${product.name} → ${farmerName}...`);

      // Prepare update with all existing fields
      const updateData = {
        farmer_id: farmerId,
        name: product.name,
        variant: product.variant,
        fullPrice: product.fullPrice,
        discount: product.discount,
        finalPrice: product.finalPrice,
        stock: product.stock,
        description: product.description,
        images: product.images,
        createdAt: product.createdAt,
      };

      const { status: updateStatus, data: updateResult } = await makeRequest(
        `/v1/databases/${databaseId}/collections/products/documents/${product.$id}`,
        'PATCH',
        updateData
      );

      if (updateStatus === 200) {
        console.log(' ✅');
        updated++;
      } else {
        console.log(' ❌');
        console.log(`      Error: ${updateResult.message}`);
        failed++;
      }
    }

    console.log(`\n✅ COMPLETED!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed: ${failed}\n`);

    // Show summary
    console.log('📈 FARMER ASSIGNMENT SUMMARY:\n');
    const byFarmer = {};
    for (let i = 0; i < products.length; i++) {
      const farmerIndex = Math.floor(i / productsPerFarmer) % farmersList.length;
      const farmerEntry = Object.entries(FARMER_IDS)[farmerIndex];
      byFarmer[farmerEntry[0]] = (byFarmer[farmerEntry[0]] || 0) + 1;
    }

    Object.entries(byFarmer).forEach(([name, count]) => {
      console.log(`   ${name}: ${count} products`);
    });

    console.log('\n✨ NEXT STEP: Verify products are showing on /home page\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

assignProductsToFarmers();
