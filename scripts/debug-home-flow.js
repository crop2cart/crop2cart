// scripts/debug-home-flow.js
// Debug script to test the entire /home page flow

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
  console.log('\n' + '='.repeat(70));
  console.log('🔍 DEBUGGING /HOME PAGE FLOW');
  console.log('='.repeat(70) + '\n');

  console.log('📋 STEP 1: Verify Environment Variables');
  console.log('-'.repeat(70));
  console.log(`✓ ENDPOINT: ${ENDPOINT}`);
  console.log(`✓ PROJECT_ID: ${PROJECT_ID ? PROJECT_ID.substring(0, 10) + '...' : 'MISSING'}`);
  console.log(`✓ DATABASE_ID: ${DATABASE_ID ? DATABASE_ID.substring(0, 10) + '...' : 'MISSING'}`);
  console.log(`✓ API_KEY: ${API_KEY ? 'SET' : 'MISSING'}\n`);

  console.log('📋 STEP 2: Check Farmer Collections Exist');
  console.log('-'.repeat(70));
  for (const farmer of FARMERS) {
    const checkResp = await apiRequest('GET', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}`);
    if (checkResp.ok) {
      console.log(`✓ ${farmer.name}: Collection EXISTS`);
    } else {
      console.log(`✗ ${farmer.name}: Collection MISSING - ${checkResp.data?.message || 'Unknown error'}`);
    }
  }
  console.log();

  console.log('📋 STEP 3: Check Products in Each Collection');
  console.log('-'.repeat(70));
  for (const farmer of FARMERS) {
    const docsResp = await apiRequest('GET', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}/documents?limit=100`);
    if (docsResp.ok) {
      const count = docsResp.data.documents?.length || 0;
      console.log(`✓ ${farmer.name}: ${count} products`);
      
      if (count > 0) {
        const first = docsResp.data.documents[0];
        console.log(`  └─ First product: "${first.name}" (${first.variant}), Price: ₹${first.fullPrice}`);
      }
    } else {
      console.log(`✗ ${farmer.name}: Failed to fetch documents - ${docsResp.data?.message || 'Unknown error'}`);
    }
  }
  console.log();

  console.log('📋 STEP 4: Test API Endpoints');
  console.log('-'.repeat(70));
  
  // Test 1: GET /api/products
  console.log('Testing GET /api/products:');
  try {
    const res = await fetch('http://localhost:3000/api/products');
    const data = await res.json();
    console.log(`  Status: ${res.status}`);
    console.log(`  Total products: ${data.data?.length || 0}`);
  } catch (error) {
    console.log(`  ✗ ERROR: ${error.message}`);
  }
  console.log();

  // Test 2: GET /api/products/by-farmer for each farmer
  console.log('Testing GET /api/products/by-farmer:');
  for (const farmer of FARMERS) {
    try {
      const res = await fetch(`http://localhost:3000/api/products/by-farmer?farmer_id=${farmer.id}`);
      const data = await res.json();
      console.log(`  ${farmer.name}: Status ${res.status}, Products: ${Array.isArray(data) ? data.length : 'ERROR'}`);
    } catch (error) {
      console.log(`  ${farmer.name}: ✗ ${error.message}`);
    }
  }
  console.log();

  console.log('='.repeat(70));
  console.log('✅ DEBUG COMPLETE');
  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
