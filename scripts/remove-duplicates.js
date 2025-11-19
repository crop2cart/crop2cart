#!/usr/bin/env node
// scripts/remove-duplicates.js
// Remove duplicate products from farmer collections

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
    const text = await response.text();
    let result = {};
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = { message: text };
    }
    return { ok: response.ok, status: response.status, data: result };
  } catch (error) {
    return { ok: false, status: 0, error: error.message };
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 CHECKING FOR DUPLICATES IN FARMER COLLECTIONS');
  console.log('='.repeat(70) + '\n');

  for (const farmer of FARMERS) {
    console.log(`📋 Processing ${farmer.name}...`);
    
    // Fetch all products
    const docsResp = await apiRequest('GET', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}/documents?limit=100`);
    
    if (!docsResp.ok) {
      console.log(`  ✗ Failed to fetch documents: ${docsResp.data?.message}`);
      continue;
    }

    const documents = docsResp.data.documents || [];
    console.log(`  Total documents: ${documents.length}`);

    // Find duplicates by product name
    const productMap = {};
    const duplicates = [];
    const unique = [];

    for (const doc of documents) {
      const key = `${doc.name}_${doc.variant}`;
      
      if (productMap[key]) {
        // This is a duplicate
        duplicates.push({
          id: doc.$id,
          name: doc.name,
          variant: doc.variant,
          key: key
        });
        console.log(`    Duplicate found: ${doc.name} ${doc.variant} (ID: ${doc.$id})`);
      } else {
        // First occurrence
        productMap[key] = doc.$id;
        unique.push({
          id: doc.$id,
          name: doc.name,
          variant: doc.variant,
          key: key
        });
      }
    }

    console.log(`  Unique products: ${unique.length}`);
    console.log(`  Duplicate entries: ${duplicates.length}`);

    // Delete duplicates
    if (duplicates.length > 0) {
      console.log(`\n  🗑️  Deleting ${duplicates.length} duplicate(s)...`);
      
      let deleted = 0;
      for (const dup of duplicates) {
        const delResp = await apiRequest('DELETE', `/databases/${DATABASE_ID}/collections/${farmer.collectionId}/documents/${dup.id}`);
        
        if (delResp.ok) {
          deleted++;
          console.log(`    ✓ Deleted: ${dup.name} ${dup.variant}`);
        } else {
          console.log(`    ✗ Failed to delete ${dup.name}: Status ${delResp.status} - ${delResp.data?.message || delResp.error || 'Unknown error'}`);
        }
      }
      
      console.log(`  ✓ Successfully deleted ${deleted}/${duplicates.length} duplicates`);
    } else {
      console.log(`  ✓ No duplicates found`);
    }

    console.log();
  }

  console.log('='.repeat(70));
  console.log('✅ DUPLICATE CHECK & REMOVAL COMPLETE');
  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
