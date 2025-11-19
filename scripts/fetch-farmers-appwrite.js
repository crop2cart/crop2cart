/**
 * Fetch Real Farmers Data from Appwrite with Location Details
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
  console.log('\n📍 FETCHING REAL FARMERS DATA FROM APPWRITE\n');

  try {
    // Get farmers from Appwrite
    console.log('🔍 Fetching farmers collection...');
    const farmers = await apiCall('GET', `/v1/databases/${databaseId}/collections/farmers/documents?limit=100`);
    
    console.log(`✅ Found ${farmers.documents.length} farmers\n`);
    console.log('📋 FARMERS DATA IN APPWRITE:\n');

    farmers.documents.forEach((farmer, idx) => {
      console.log(`${idx + 1}. ${farmer.farmName || 'N/A'}`);
      console.log(`   📧 Email: ${farmer.email}`);
      console.log(`   📍 Address: ${farmer.address}`);
      console.log(`   🌐 Latitude: ${farmer.latitude}`);
      console.log(`   🌐 Longitude: ${farmer.longitude}`);
      console.log(`   📍 Area: ${farmer.areaName}`);
      console.log(`   🏙️  State: ${farmer.state}`);
      console.log(`   📞 Phone: ${farmer.phone || 'N/A'}`);
      console.log(`   ID: ${farmer.$id}`);
      console.log('');
    });

    if (farmers.documents.length > 0) {
      // Generate farmers constant code
      console.log('\n💾 GENERATED CONSTANT FOR /lib/farmers.ts:\n');
      console.log('```typescript');
      console.log('export const FARMERS = [');
      
      farmers.documents.forEach(farmer => {
        console.log('  {');
        console.log(`    id: '${farmer.$id}',`);
        console.log(`    name: '${farmer.farmName}',`);
        console.log(`    email: '${farmer.email}',`);
        console.log(`    address: '${farmer.address}',`);
        console.log(`    area: '${farmer.areaName}',`);
        console.log(`    latitude: ${parseFloat(farmer.latitude)},`);
        console.log(`    longitude: ${parseFloat(farmer.longitude)},`);
        console.log(`    state: '${farmer.state}',`);
        console.log('  },');
      });
      
      console.log('];');
      console.log('```\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
