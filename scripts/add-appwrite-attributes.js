#!/usr/bin/env node

/**
 * Appwrite Collection Attribute Management Script
 * Adds missing attributes to Appwrite collections
 */

const fs = require('fs');
const path = require('path');

// Load .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

loadEnv();

const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'freshmart'
};

console.log('='.repeat(80));
console.log('APPWRITE COLLECTION ATTRIBUTE MANAGEMENT');
console.log('='.repeat(80));
console.log('\n[CONFIG]');
console.log(`Endpoint: ${APPWRITE_CONFIG.endpoint}`);
console.log(`Project ID: ${APPWRITE_CONFIG.projectId}`);
console.log(`Database ID: ${APPWRITE_CONFIG.databaseId}`);
console.log(`API Key: ${APPWRITE_CONFIG.apiKey ? '✓ Found' : '✗ Missing'}`);

if (!APPWRITE_CONFIG.projectId || !APPWRITE_CONFIG.apiKey) {
  console.error('\n❌ ERROR: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY');
  process.exit(1);
}

async function createAttribute(collectionId, attributeConfig) {
  const endpoint = APPWRITE_CONFIG.endpoint.replace('/v1', '');
  // Correct endpoint for creating attributes
  const url = `${endpoint}/v1/databases/${APPWRITE_CONFIG.databaseId}/collections/${collectionId}/attributes/integer`;

  console.log(`\n  Adding attribute: ${attributeConfig.key}...`);
  console.log(`    Type: ${attributeConfig.type}`);
  console.log(`    Required: ${attributeConfig.required}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
        'X-Appwrite-Key': APPWRITE_CONFIG.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: attributeConfig.key,
        required: attributeConfig.required,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      
      // Check if attribute already exists
      if (error.includes('Attribute already exists')) {
        console.log(`  ✓ Attribute already exists (no action needed)`);
        return { success: true, existed: true };
      }
      
      console.error(`  ✗ Error: ${error}`);
      return { success: false, error };
    }

    const result = await response.json();
    console.log(`  ✓ Attribute added successfully`);
    return { success: true, result };
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  // Attributes to add
  const attributesToAdd = {
    signup_otp_tokens: [
      {
        key: 'updated_at',
        type: 'integer',
        required: false,
        payload: {
          type: 'integer',
          required: false,
        }
      }
    ]
  };

  console.log('\n' + '='.repeat(80));
  console.log('ATTRIBUTES TO ADD');
  console.log('='.repeat(80));

  for (const [collectionId, attributes] of Object.entries(attributesToAdd)) {
    console.log(`\n[COLLECTION: ${collectionId}]`);
    
    for (const attr of attributes) {
      const result = await createAttribute(collectionId, attr);
      
      if (!result.success) {
        console.error(`\n❌ Failed to add attribute ${attr.key}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('ATTRIBUTE MANAGEMENT COMPLETE');
  console.log('='.repeat(80));
  console.log('\nNext steps:');
  console.log('1. Run: node scripts/check-appwrite-schema.js');
  console.log('2. Verify updated_at now exists in signup_otp_tokens');
  console.log('3. Update code to include updated_at in signup_otp_tokens documents\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
