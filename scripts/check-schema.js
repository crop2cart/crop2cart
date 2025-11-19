#!/usr/bin/env node

/**
 * Script to verify and check Appwrite products collection schema
 * Run with: node scripts/check-schema.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const endpoint = env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error('❌ Missing environment variables');
  console.log('Required: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY, NEXT_PUBLIC_APPWRITE_DATABASE_ID');
  process.exit(1);
}

async function checkSchema() {
  try {
    const baseUrl = endpoint.replace('/v1', '');
    const headers = {
      'X-Appwrite-Key': apiKey,
      'X-Appwrite-Project': projectId,
      'Content-Type': 'application/json',
    };

    console.log('\n📋 Checking Appwrite Products Collection Schema...\n');
    console.log(`Database ID: ${databaseId}`);
    console.log(`Endpoint: ${endpoint}\n`);

    // Get collection schema
    const collectionResponse = await fetch(
      `${baseUrl}/v1/databases/${databaseId}/collections/products`,
      { headers }
    );

    if (!collectionResponse.ok) {
      console.error('❌ Failed to fetch collection:', collectionResponse.status);
      const error = await collectionResponse.text();
      console.error(error);
      return;
    }

    const collection = await collectionResponse.json();

    console.log('✅ Collection Found: products\n');
    console.log('📊 Current Attributes:\n');

    const attributes = collection.attributes || [];

    if (attributes.length === 0) {
      console.log('⚠️  No attributes found');
      return;
    }

    attributes.forEach((attr, index) => {
      console.log(`${index + 1}. ${attr.key}`);
      console.log(`   Type: ${attr.type}`);
      console.log(`   Required: ${attr.required}`);
      if (attr.type === 'string' && attr.size) {
        console.log(`   Size: ${attr.size}`);
      }
      console.log('');
    });

    // Check for required fields
    console.log('🔍 Required Fields Check:\n');

    const requiredFields = [
      'name',
      'variant',
      'fullPrice',
      'discount',
      'finalPrice',
      'stock',
      'description',
      'imageUrl',
      'imageId',
      'farmerId',
    ];

    const foundFields = attributes.map((attr) => attr.key);
    const missingFields = requiredFields.filter((field) => !foundFields.includes(field));

    requiredFields.forEach((field) => {
      const found = foundFields.includes(field);
      console.log(`${found ? '✅' : '❌'} ${field}`);
    });

    if (missingFields.length > 0) {
      console.log(`\n⚠️  Missing fields: ${missingFields.join(', ')}`);
      console.log('\nRun: node scripts/update-schema.js to add missing fields');
    } else {
      console.log('\n✅ All required fields present!');
    }

    // Get sample product to see data structure
    console.log('\n📦 Sample Products:\n');

    const productsResponse = await fetch(
      `${baseUrl}/v1/databases/${databaseId}/collections/products/documents?limit=1`,
      { headers }
    );

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.documents.length > 0) {
        const sample = productsData.documents[0];
        console.log('First Product Fields:');
        Object.entries(sample).forEach(([key, value]) => {
          if (!key.startsWith('$')) {
            console.log(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : value}`);
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkSchema();
