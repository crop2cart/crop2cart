/**
 * Check Products & Locations - Get Hyderabad Location Data
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

// Real Hyderabad locations with coordinates
const HYDERABAD_LOCATIONS = [
  {
    name: 'Organic Farms Hyderabad',
    location: 'Shadnagar, Hyderabad, Telangana',
    area: '45 km away',
    latitude: 17.0755,
    longitude: 78.3697,
    email: 'yakoge2234@gusronk.com',
    description: 'Premium organic produce from Shadnagar valley'
  },
  {
    name: 'Nalgonda Fresh Produce',
    location: 'Nalgonda, Telangana',
    area: '78 km away',
    latitude: 17.0667,
    longitude: 79.1333,
    email: 'vineethkumar45677@gmail.com',
    description: 'Fresh vegetables from Nalgonda region'
  },
  {
    name: 'Ranga Reddy Farms',
    location: 'Tandoor, Ranga Reddy District, Telangana',
    area: '52 km away',
    latitude: 17.4358,
    longitude: 78.4508,
    email: 'vineethedits01@gmail.com',
    description: 'Quality produce from Tandoor farming area'
  }
];

async function main() {
  console.log('\n📍 CHECKING PRODUCTS & LOCATIONS SCHEMA\n');

  try {
    // Get all collections
    console.log('📊 Fetching collections...');
    const collectionsResponse = await apiCall('GET', `/v1/databases/${databaseId}/collections`);
    
    // Check products
    const productsCollection = collectionsResponse.collections.find(c => c.$id === 'products');
    if (productsCollection) {
      console.log(`\n✅ Found products collection`);
      console.log(`\n📋 Products Attributes:`);
      productsCollection.attributes?.forEach(attr => {
        console.log(`  • ${attr.key} (${attr.type})`);
      });

      // Get sample product
      const products = await apiCall('GET', `/v1/databases/${databaseId}/collections/products/documents?limit=1`);
      console.log(`\n✅ Total products: ${products.total}`);
      
      if (products.documents.length > 0) {
        console.log(`\n📋 Sample Product:`);
        const product = products.documents[0];
        Object.keys(product).forEach(key => {
          if (!key.startsWith('$')) {
            const value = product[key];
            if (typeof value === 'object') {
              console.log(`  • ${key}: [Object]`);
            } else if (typeof value === 'string' && value.length > 100) {
              console.log(`  • ${key}: ${value.substring(0, 100)}...`);
            } else {
              console.log(`  • ${key}: ${value}`);
            }
          }
        });
      }
    }

    // Check farmers collection
    const farmersCollection = collectionsResponse.collections.find(c => c.$id === 'farmers');
    if (farmersCollection) {
      console.log(`\n\n✅ Found farmers collection`);
      console.log(`\n📋 Farmers Attributes:`);
      farmersCollection.attributes?.forEach(attr => {
        console.log(`  • ${attr.key} (${attr.type})`);
      });

      const farmers = await apiCall('GET', `/v1/databases/${databaseId}/collections/farmers/documents`);
      console.log(`\n✅ Farmers documents: ${farmers.total}`);
    } else {
      console.log('\n\nℹ️ No farmers collection found');
    }

    console.log('\n\n🌍 RECOMMENDED HYDERABAD LOCATIONS:\n');
    HYDERABAD_LOCATIONS.forEach((loc, idx) => {
      console.log(`${idx + 1}. ${loc.name}`);
      console.log(`   📍 ${loc.location}`);
      console.log(`   📏 ${loc.area}`);
      console.log(`   🌐 Lat: ${loc.latitude}, Lng: ${loc.longitude}`);
      console.log(`   📧 ${loc.email}`);
      console.log(`   ℹ️  ${loc.description}`);
      console.log('');
    });

    console.log('\n✨ Schema analysis complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
