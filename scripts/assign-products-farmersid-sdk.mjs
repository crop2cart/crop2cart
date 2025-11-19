// scripts/assign-products-farmersid-sdk.mjs
// Assign products using the SDK method similar to the API

import { Client, Databases } from 'appwrite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const client = new Client()
  .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Farmer IDs
const FARMER_IDS = {
  yakoge: '691d71728aae9e02a5a7',
  greenValley: '691d7173228d6f9d54a0',
  freshHarvest: '691d7173bc793e81f6e0',
};

async function assignProductsToFarmers() {
  try {
    console.log('\n🎯 ASSIGNING PRODUCTS TO FARMERS (SDK METHOD)\n');

    // Fetch all products
    console.log('1️⃣  Fetching all products...');
    const productsResponse = await databases.listDocuments(
      databaseId,
      'products'
    );

    const products = productsResponse.documents;
    console.log(`✅ Found ${products.length} products\n`);

    // Distribution
    const farmersList = Object.values(FARMER_IDS);
    const productsPerFarmer = Math.ceil(products.length / farmersList.length);

    console.log('📊 ASSIGNMENT PLAN:');
    console.log(`   Products per farmer: ${productsPerFarmer}\n`);

    console.log('📋 UPDATING PRODUCTS:\n');
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmerIndex = Math.floor(i / productsPerFarmer) % farmersList.length;
      const farmerId = farmersList[farmerIndex];
      
      const farmerName = Object.entries(FARMER_IDS).find(([_, id]) => id === farmerId)?.[0] || 'unknown';
      
      process.stdout.write(`   ${i + 1}/${products.length} - ${product.name} → ${farmerName}...`);

      try {
        // Update document with farmer_id
        await databases.updateDocument(
          databaseId,
          'products',
          product.$id,
          {
            farmer_id: farmerId,
          }
        );

        console.log(' ✅');
        updated++;
      } catch (error) {
        console.log(' ❌');
        console.log(`      Error: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n✅ COMPLETED!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed: ${failed}\n`);

    // Verify
    console.log('📈 VERIFYING ASSIGNMENT:\n');
    const updatedProducts = await databases.listDocuments(
      databaseId,
      'products'
    );

    const byFarmer = {};
    updatedProducts.documents.forEach((p) => {
      const farmerId = p.farmer_id || 'NO_FARMER';
      byFarmer[farmerId] = (byFarmer[farmerId] || 0) + 1;
    });

    Object.entries(byFarmer).forEach(([farmerId, count]) => {
      const farmerName = Object.entries(FARMER_IDS).find(([_, id]) => id === farmerId)?.[0] || farmerId;
      console.log(`   ${farmerName}: ${count} products`);
    });

    console.log('\n✨ ASSIGNMENT COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

assignProductsToFarmers();
