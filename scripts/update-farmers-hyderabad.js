/**
 * Update Farmers with Real Hyderabad Locations
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

// Real Hyderabad farmers data
const HYDERABAD_FARMERS = [
  {
    farmName: 'Organic Farms Hyderabad',
    areaName: 'Shadnagar',
    address: 'Shadnagar, Hyderabad, Telangana',
    latitude: '17.0755',
    longitude: '78.3697',
    email: 'yakoge2234@gusronk.com',
    phone: '+91-9876543210',
    state: 'Telangana'
  },
  {
    farmName: 'Nalgonda Fresh Produce',
    areaName: 'Nalgonda',
    address: 'Nalgonda, Telangana',
    latitude: '17.0667',
    longitude: '79.1333',
    email: 'vineethkumar45677@gmail.com',
    phone: '+91-9876543211',
    state: 'Telangana'
  },
  {
    farmName: 'Ranga Reddy Farms',
    areaName: 'Tandoor',
    address: 'Tandoor, Ranga Reddy District, Telangana',
    latitude: '17.4358',
    longitude: '78.4508',
    email: 'vineethedits01@gmail.com',
    phone: '+91-9876543212',
    state: 'Telangana'
  }
];

async function main() {
  console.log('\n🌾 UPDATING FARMERS WITH HYDERABAD LOCATIONS\n');

  try {
    // Get existing farmers
    console.log('📊 Fetching existing farmers...');
    const farmersResponse = await apiCall('GET', `/v1/databases/${databaseId}/collections/farmers/documents`);
    console.log(`✅ Found ${farmersResponse.documents.length} farmers\n`);

    if (farmersResponse.documents.length > 0) {
      // Update existing farmers
      console.log('🔄 Updating existing farmers with Hyderabad data...\n');
      
      for (let i = 0; i < Math.min(HYDERABAD_FARMERS.length, farmersResponse.documents.length); i++) {
        const farmer = farmersResponse.documents[i];
        const newData = HYDERABAD_FARMERS[i];

        try {
          await apiCall('PATCH', `/v1/databases/${databaseId}/collections/farmers/documents/${farmer.$id}`, {
            farmName: newData.farmName,
            areaName: newData.areaName,
            address: newData.address,
            latitude: newData.latitude,
            longitude: newData.longitude,
            email: newData.email,
            phone: newData.phone,
            state: newData.state,
          });

          console.log(`✅ Updated Farmer ${i + 1}: ${newData.farmName}`);
          console.log(`   📍 ${newData.address}`);
          console.log(`   🌐 Lat: ${newData.latitude}, Lng: ${newData.longitude}\n`);
        } catch (e) {
          console.error(`❌ Failed to update farmer ${i + 1}:`, e.message);
        }
      }
    }

    // Also create new farmers if needed (if we have more than existing)
    if (HYDERABAD_FARMERS.length > farmersResponse.documents.length) {
      console.log(`\n📝 Creating additional farmers...\n`);
      
      for (let i = farmersResponse.documents.length; i < HYDERABAD_FARMERS.length; i++) {
        const newData = HYDERABAD_FARMERS[i];
        try {
          const created = await apiCall('POST', `/v1/databases/${databaseId}/collections/farmers/documents`, {
            documentId: 'unique()',
            farmName: newData.farmName,
            areaName: newData.areaName,
            address: newData.address,
            latitude: newData.latitude,
            longitude: newData.longitude,
            email: newData.email,
            phone: newData.phone,
            state: newData.state,
            userId: `farmer_${i + 1}`,
          });

          console.log(`✅ Created Farmer ${i + 1}: ${newData.farmName}`);
          console.log(`   ID: ${created.$id}`);
          console.log(`   📍 ${newData.address}\n`);
        } catch (e) {
          console.error(`❌ Failed to create farmer ${i + 1}:`, e.message);
        }
      }
    }

    // Display final data
    console.log('\n📋 FINAL FARMERS CONFIGURATION:\n');
    HYDERABAD_FARMERS.forEach((farmer, idx) => {
      console.log(`${idx + 1}. ${farmer.farmName}`);
      console.log(`   📍 ${farmer.address}`);
      console.log(`   📧 ${farmer.email}`);
      console.log(`   🌐 Coordinates: (${farmer.latitude}, ${farmer.longitude})`);
      console.log('');
    });

    console.log('✨ Farmers updated successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
