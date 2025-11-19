/**
 * Check Farmers Collection Schema Carefully
 */

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

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;

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
  console.log('\n🔍 CHECKING FARMERS COLLECTION SCHEMA\n');

  try {
    // Get collection
    const collections = await apiCall('GET', `/v1/databases/${databaseId}/collections`);
    const farmersCollection = collections.collections.find(c => c.$id === 'farmers');

    if (!farmersCollection) {
      console.log('❌ Farmers collection not found!');
      return;
    }

    console.log('📋 FARMERS COLLECTION ATTRIBUTES:\n');
    farmersCollection.attributes.forEach((attr, idx) => {
      const required = attr.required ? '✅ REQUIRED' : '⚪ OPTIONAL';
      console.log(`${idx + 1}. ${attr.key}`);
      console.log(`   Type: ${attr.type}`);
      console.log(`   Status: ${required}`);
      if (attr.size) console.log(`   Size: ${attr.size}`);
      console.log('');
    });

    // Get sample farmer
    console.log('📋 SAMPLE FARMER DOCUMENT:\n');
    const farmers = await apiCall('GET', `/v1/databases/${databaseId}/collections/farmers/documents?limit=1`);
    
    if (farmers.documents.length > 0) {
      const farmer = farmers.documents[0];
      console.log(JSON.stringify(farmer, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
