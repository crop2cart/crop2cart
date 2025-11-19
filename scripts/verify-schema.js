#!/usr/bin/env node

/**
 * Script to verify and update Appwrite products collection schema for Cloudinary
 * Run with: node scripts/verify-schema.js
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
  process.exit(1);
}

async function verifyAndUpdateSchema() {
  try {
    const baseUrl = endpoint.replace('/v1', '');
    const headers = {
      'X-Appwrite-Key': apiKey,
      'X-Appwrite-Project': projectId,
      'Content-Type': 'application/json',
    };

    console.log('\n📋 Verifying Appwrite Products Collection Schema...\n');

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
    const attributes = collection.attributes || [];
    const existingFields = attributes.map((attr) => attr.key);

    console.log('✅ Current Fields:');
    console.log('  ' + existingFields.join(', '));
    console.log('');

    // Check for images field
    const hasImages = existingFields.includes('images');
    console.log(`📸 Images Field: ${hasImages ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!hasImages) {
      console.log('\n➕ Adding images field...');

      const addFieldResponse = await fetch(
        `${baseUrl}/v1/databases/${databaseId}/collections/products/attributes`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            key: 'images',
            type: 'json',
            required: false,
          }),
        }
      );

      if (!addFieldResponse.ok) {
        const error = await addFieldResponse.text();
        console.error('❌ Failed to add images field:', error);
        return;
      }

      console.log('✅ Added images field successfully');
    } else {
      console.log('✅ Images field already exists');
    }

    console.log('\n✅ Schema verification complete!\n');
    console.log('📊 Final Schema Summary:');
    console.log('  Database: ' + databaseId);
    console.log('  Collection: products');
    console.log('  Storage: Cloudinary (cloudinary.com)');
    console.log('  Images Field: JSON array (stores Cloudinary URLs)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAndUpdateSchema();
