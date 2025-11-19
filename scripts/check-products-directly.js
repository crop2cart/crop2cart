// scripts/check-products-directly.js
// Fetch products using the same method as the API

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

// Use the same approach as lib/appwrite.ts getServerAppwrite
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.replace('/v1', '');
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const https = require('https');
const http = require('http');

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

async function checkProducts() {
  try {
    console.log('\n📦 CHECKING PRODUCTS FROM APPWRITE\n');
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Project: ${projectId}`);
    console.log(`Database: ${databaseId}\n`);

    // Fetch products
    const { status, data } = await makeRequest(`/v1/databases/${databaseId}/collections/products/documents`);

    console.log(`Status: ${status}\n`);

    if (status !== 200) {
      console.error('❌ Error:', data);
      return;
    }

    console.log(`✅ Total products: ${data.total}\n`);

    if (data.total > 0) {
      console.log('🔍 FIRST PRODUCT STRUCTURE:');
      const first = data.documents[0];
      console.log(JSON.stringify(first, null, 2));

      console.log('\n\n📊 CHECKING ALL PRODUCTS:');
      data.documents.forEach((product, idx) => {
        console.log(`\n  ${idx + 1}. ${product.name}`);
        console.log(`     ID: ${product.$id}`);
        console.log(`     Has farmer_id: ${'farmer_id' in product}`);
        if ('farmer_id' in product) {
          console.log(`     farmer_id: ${product.farmer_id}`);
        }
        console.log(`     Price: ${product.finalPrice}`);
      });

      // Check if farmer_id is populated
      const withFarmerId = data.documents.filter(p => p.farmer_id);
      const withoutFarmerId = data.documents.filter(p => !p.farmer_id);

      console.log(`\n\n📈 SUMMARY:`);
      console.log(`  Total: ${data.total}`);
      console.log(`  With farmer_id: ${withFarmerId.length}`);
      console.log(`  Without farmer_id: ${withoutFarmerId.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProducts();
