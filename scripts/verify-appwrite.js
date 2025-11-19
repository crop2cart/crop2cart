#!/usr/bin/env node

/**
 * Comprehensive Appwrite Setup Verification Script
 * Checks: Connection, Database, Collections, Attributes, and Test User
 */

const https = require('https');
const crypto = require('crypto');

const APPWRITE_ENDPOINT = 'cloud.appwrite.io';
const APPWRITE_PROJECT_ID = '691cc78f002782a96b55';
const APPWRITE_API_KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';
const DATABASE_ID = 'freshmart';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: APPWRITE_ENDPOINT,
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function verifySetup() {
  try {
    console.log('\n🔍 APPWRITE SETUP VERIFICATION\n');
    console.log('=' .repeat(60));

    // 1. Check Connection
    console.log('\n📡 1. Testing Appwrite Connection...');
    try {
      const healthResult = await makeRequest('GET', '/health');
      if (healthResult.status === 200) {
        console.log('   ✅ Connection successful');
        console.log(`   Status: ${healthResult.data.status}`);
      } else {
        console.log(`   ❌ Connection failed: ${healthResult.status}`);
      }
    } catch (err) {
      console.log(`   ❌ Connection error: ${err.message}`);
    }

    // 2. Check Project
    console.log('\n📦 2. Checking Project...');
    const projectResult = await makeRequest('GET', '/projects/' + APPWRITE_PROJECT_ID);
    if (projectResult.status === 200) {
      console.log(`   ✅ Project found: ${projectResult.data.name}`);
    } else {
      console.log(`   ❌ Project error: ${projectResult.data?.message || projectResult.status}`);
    }

    // 3. Check Database
    console.log('\n🗄️  3. Checking Database...');
    const dbResult = await makeRequest('GET', `/databases/${DATABASE_ID}`);
    if (dbResult.status === 200) {
      console.log(`   ✅ Database exists: ${dbResult.data.name}`);
    } else {
      console.log(`   ❌ Database error: ${dbResult.data?.message || dbResult.status}`);
      return;
    }

    // 4. Check Collections
    console.log('\n📋 4. Checking Collections...');
    const collectionsResult = await makeRequest('GET', `/databases/${DATABASE_ID}/collections`);
    if (collectionsResult.status === 200) {
      const collections = collectionsResult.data.collections || [];
      console.log(`   Found ${collections.length} collections:`);
      for (const col of collections) {
        console.log(`   ✅ ${col.$id} (${col.name})`);
      }
    } else {
      console.log(`   ❌ Collections error: ${collectionsResult.data?.message}`);
    }

    // 5. Check Users Collection Attributes
    console.log('\n🔑 5. Checking Users Collection Attributes...');
    const usersResult = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users`);
    if (usersResult.status === 200) {
      const attributes = usersResult.data.attributes || [];
      console.log(`   Found ${attributes.length} attributes:`);
      for (const attr of attributes) {
        console.log(`   ✅ ${attr.key} (${attr.type})`);
      }
    } else {
      console.log(`   ❌ Users collection error: ${usersResult.data?.message}`);
    }

    // 6. Test Query Format - Try querying for users
    console.log('\n🔍 6. Testing Query Format...');
    console.log('   Attempting to query users with email = test@example.com');
    const testEmail = 'test@example.com';
    
    // Try the URL-encoded query format
    const queryUrl = `/databases/${DATABASE_ID}/collections/users/documents?queries[0]=${encodeURIComponent(`Query.equal("email", "${testEmail}")`)}`;
    console.log(`   URL: ${queryUrl}`);
    
    const queryResult = await makeRequest('GET', queryUrl);
    console.log(`   Response status: ${queryResult.status}`);
    if (queryResult.status === 200) {
      console.log(`   ✅ Query format accepted`);
      console.log(`   Documents found: ${queryResult.data.documents?.length || 0}`);
    } else {
      console.log(`   ❌ Query error: ${queryResult.data?.message || JSON.stringify(queryResult.data)}`);
    }

    // 7. List all documents in users collection
    console.log('\n📄 7. Listing All Users...');
    const allUsersResult = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`);
    if (allUsersResult.status === 200) {
      const docs = allUsersResult.data.documents || [];
      console.log(`   Total users: ${docs.length}`);
      for (const doc of docs) {
        console.log(`   - ${doc.email} (${doc.name})`);
      }
    } else {
      console.log(`   ❌ Error: ${allUsersResult.data?.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Verification Complete\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run with timeout
setTimeout(() => {
  console.error('❌ Request timeout');
  process.exit(1);
}, 60000);

verifySetup();
