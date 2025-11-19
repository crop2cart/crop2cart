// scripts/add-farmer-id-field.js
// Add farmer_id attribute to products collection

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

async function addFarmerIdField() {
  try {
    console.log('\n📦 ADDING farmer_id FIELD TO PRODUCTS COLLECTION\n');

    // First, check if field already exists
    console.log('1️⃣  Checking if farmer_id field already exists...');
    const { status: getStatus, data: collection } = await makeRequest(
      `/v1/databases/${databaseId}/collections/products`
    );

    if (getStatus !== 200) {
      console.error('❌ Error fetching collection:', collection);
      return;
    }

    const hasField = collection.attributes?.some(attr => attr.key === 'farmer_id');
    
    if (hasField) {
      console.log('✅ farmer_id field already exists!\n');
      return;
    }

    console.log('❌ farmer_id field not found. Adding it now...\n');

    // Add farmer_id field (string type, required for future products)
    const { status: addStatus, data: addResult } = await makeRequest(
      `/v1/databases/${databaseId}/collections/products/attributes/string`,
      'POST',
      {
        key: 'farmer_id',
        size: 256,
        required: false,  // Start as optional for existing products
        default: null,
      }
    );

    if (addStatus < 200 || addStatus >= 300) {
      console.error('❌ Error adding field:', addResult);
      return;
    }

    console.log('✅ farmer_id field added successfully!\n');
    console.log('📝 Field details:');
    console.log('   Key: farmer_id');
    console.log('   Type: String');
    console.log('   Size: 256');
    console.log('   Required: false (for existing products)');
    console.log('\n✨ NEXT STEP: Run script to assign existing products to farmers');
    console.log('   Command: node scripts/assign-products-to-farmers.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addFarmerIdField();
