/**
 * Add Missing Farmers to Appwrite with Hyderabad Coordinates
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

// Real Hyderabad locations with actual coordinates
const NEW_FARMERS = [
  {
    userId: 'farmer-green-valley',
    name: 'Green Valley Farmer',
    farmName: 'Green Valley Farms',
    areaName: 'Shamshabad',
    address: 'Shamshabad, Hyderabad, Telangana',
    latitude: '17.2391',
    longitude: '78.4056',
    email: 'vineethkumar45677@gmail.com',
    phone: '9876543211',
    state: 'Telangana'
  },
  {
    userId: 'farmer-fresh-harvest',
    name: 'Fresh Harvest Farmer',
    farmName: 'Fresh Harvest Co.',
    areaName: 'Ghatkesar',
    address: 'Ghatkesar, Hyderabad, Telangana',
    latitude: '17.3566',
    longitude: '78.6631',
    email: 'vineethedits01@gmail.com',
    phone: '9876543212',
    state: 'Telangana'
  }
];

async function main() {
  console.log('\n🌾 ADDING NEW FARMERS TO APPWRITE\n');

  try {
    // First get existing farmers to check
    console.log('📊 Checking existing farmers...');
    const existing = await apiCall('GET', `/v1/databases/${databaseId}/collections/farmers/documents?limit=100`);
    console.log(`✅ Found ${existing.documents.length} existing farmers\n`);

    // Add new farmers
    console.log('➕ Creating new farmers...\n');
    const created = [];

    for (const farmer of NEW_FARMERS) {
      try {
        // Create document with all required fields
        const newFarmer = await apiCall('POST', `/v1/databases/${databaseId}/collections/farmers/documents`, {
          documentId: 'unique()',
          data: {
            userId: farmer.userId,
            name: farmer.name,
            email: farmer.email,
            farmName: farmer.farmName,
            address: farmer.address,
            areaName: farmer.areaName,
            latitude: farmer.latitude,
            longitude: farmer.longitude,
            phone: farmer.phone,
            state: farmer.state,
          }
        });

        created.push(newFarmer);
        console.log(`✅ Created: ${farmer.farmName}`);
        console.log(`   ID: ${newFarmer.$id}`);
        console.log(`   📍 ${farmer.address}`);
        console.log(`   🌐 Lat: ${farmer.latitude}, Lng: ${farmer.longitude}\n`);
      } catch (e) {
        console.error(`❌ Failed to create ${farmer.farmName}:`, e.message);
      }
    }

    // Fetch all farmers again
    console.log('\n📋 ALL FARMERS IN APPWRITE NOW:\n');
    const allFarmers = await apiCall('GET', `/v1/databases/${databaseId}/collections/farmers/documents?limit=100`);
    
    allFarmers.documents.forEach((farmer, idx) => {
      console.log(`${idx + 1}. ${farmer.farmName}`);
      console.log(`   📧 ${farmer.email}`);
      console.log(`   📍 ${farmer.address}`);
      console.log(`   🌐 (${farmer.latitude}, ${farmer.longitude})`);
      console.log('');
    });

    console.log('\n✨ Complete! Now run: npm run build\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
