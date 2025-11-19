#!/usr/bin/env node

/**
 * Appwrite Collection Schema Diagnostic Script
 * This script fetches the actual collection schemas from Appwrite and compares them with code
 */

// Load .env.local file
const fs = require('fs');
const path = require('path');

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
console.log('APPWRITE COLLECTION SCHEMA DIAGNOSTIC');
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

async function getCollectionSchema(collectionId) {
  const endpoint = APPWRITE_CONFIG.endpoint.replace('/v1', '');
  const url = `${endpoint}/v1/databases/${APPWRITE_CONFIG.databaseId}/collections/${collectionId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
        'X-Appwrite-Key': APPWRITE_CONFIG.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { error: `HTTP ${response.status}: ${error}` };
    }

    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

async function getCollectionDocuments(collectionId, limit = 1) {
  const endpoint = APPWRITE_CONFIG.endpoint.replace('/v1', '');
  const url = `${endpoint}/v1/databases/${APPWRITE_CONFIG.databaseId}/collections/${collectionId}/documents?limit=${limit}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
        'X-Appwrite-Key': APPWRITE_CONFIG.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { error: `HTTP ${response.status}: ${error}` };
    }

    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

function printAttributes(attrs) {
  if (!Array.isArray(attrs)) return;
  attrs.forEach(attr => {
    const required = attr.required ? '[REQUIRED]' : '[OPTIONAL]';
    console.log(`  • ${attr.key.padEnd(20)} - ${attr.type.padEnd(15)} ${required}`);
  });
}

function compareAttributes(collectionId, expectedAttrs, actualAttrs) {
  console.log(`\n  [EXPECTED vs ACTUAL]`);
  const actualKeys = actualAttrs.map(a => a.key);
  const expectedKeys = Object.keys(expectedAttrs);

  const missing = expectedKeys.filter(k => !actualKeys.includes(k));
  const extra = actualKeys.filter(k => !expectedKeys.includes(k));
  const matched = expectedKeys.filter(k => actualKeys.includes(k));

  console.log(`  ✓ Matched: ${matched.length} attributes`);
  matched.forEach(k => console.log(`    • ${k}`));

  if (missing.length > 0) {
    console.log(`  ⚠️  Missing in Appwrite: ${missing.length} attributes`);
    missing.forEach(k => console.log(`    • ${k} (code expects this!)`));
  }

  if (extra.length > 0) {
    console.log(`  ⚠️  Extra in Appwrite: ${extra.length} attributes`);
    extra.forEach(k => console.log(`    • ${k} (code does NOT use this)`));
  }
}

async function main() {
  const collections = {
    users: {
      id: 'users',
      expectedAttrs: {
        email: 'string',
        password: 'string',
        name: 'string',
        created_at: 'integer',
        updated_at: 'integer',
        phone: 'string',
        avatar_url: 'string',
        status: 'string',
        last_login: 'integer',
      }
    },
    signup_otp_tokens: {
      id: 'signup_otp_tokens',
      expectedAttrs: {
        email: 'string',
        otp: 'string',
        password: 'string',
        name: 'string',
        created_at: 'integer',
        expires_at: 'integer',
        updated_at: 'integer',
        used: 'boolean',
        verified_at: 'integer',
      }
    }
  };

  for (const [collName, collConfig] of Object.entries(collections)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`COLLECTION: ${collConfig.id}`);
    console.log('='.repeat(80));

    // Get schema
    console.log('\n[FETCHING SCHEMA]');
    const schema = await getCollectionSchema(collConfig.id);

    if (schema.error) {
      console.error(`❌ Error fetching schema: ${schema.error}`);
      continue;
    }

    console.log(`✓ Schema retrieved`);
    console.log(`  Collection: ${schema.$id}`);
    console.log(`  Attributes: ${schema.attributes?.length || 0}`);

    if (schema.attributes) {
      console.log('\n[APPWRITE ATTRIBUTES]');
      printAttributes(schema.attributes);

      console.log('\n[COMPARISON]');
      compareAttributes(collConfig.id, collConfig.expectedAttrs, schema.attributes);
    }

    // Get sample document
    console.log('\n[SAMPLE DOCUMENT]');
    const docs = await getCollectionDocuments(collConfig.id, 1);
    if (docs.error) {
      console.log(`⚠️  ${docs.error}`);
    } else if (docs.documents && docs.documents.length > 0) {
      const doc = docs.documents[0];
      console.log(`✓ Found ${docs.total} document(s)`);
      console.log('\nSample document keys:');
      Object.keys(doc).forEach(key => {
        if (!key.startsWith('$')) {
          console.log(`  • ${key}: ${typeof doc[key]} = ${JSON.stringify(doc[key]).substring(0, 50)}`);
        }
      });
    } else {
      console.log('⚠️  No documents found in this collection');
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(80));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
