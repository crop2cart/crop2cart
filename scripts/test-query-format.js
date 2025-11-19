#!/usr/bin/env node

/**
 * Test to determine correct Appwrite REST API Query format
 * The Query class generates string output that should be sent via REST API
 */

const https = require('https');

const APPWRITE_ENDPOINT = 'cloud.appwrite.io';
const APPWRITE_PROJECT_ID = '691cc78f002782a96b55';
const APPWRITE_API_KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';
const DATABASE_ID = 'freshmart';

function makeRequest(method, path, queryParams = {}) {
  return new Promise((resolve, reject) => {
    let fullPath = `/v1${path}`;
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
      fullPath += '?' + queryString;
    }

    const options = {
      hostname: APPWRITE_ENDPOINT,
      port: 443,
      path: fullPath,
      method: method,
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY,
        'Content-Type': 'application/json',
      },
    };

    console.log(`\n📡 Testing: ${method} ${fullPath}`);

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, path: fullPath });
        } catch {
          resolve({ status: res.statusCode, data: body, path: fullPath });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testQueryFormats() {
  try {
    console.log('\n🔍 TESTING APPWRITE QUERY FORMATS\n');
    console.log('=' .repeat(60));

    // Test 1: No queries (baseline)
    console.log('\n✅ Test 1: No queries (baseline)');
    let result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`);
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ Works! Found ${result.data.documents?.length || 0} documents`);
    } else {
      console.log(`   Error: ${result.data?.message}`);
    }

    // Test 2: Simple query string with array notation
    console.log('\n✅ Test 2: Simple query string queries[0]=...');
    result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`, {
      'queries[0]': 'equal("email", "hohejo6745@etramay.com")'
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ Works! Found ${result.data.documents?.length || 0} documents`);
    } else {
      console.log(`   ❌ Error: ${result.data?.message}`);
    }

    // Test 3: With Query. prefix
    console.log('\n✅ Test 3: With Query. prefix');
    result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`, {
      'queries[0]': 'Query.equal("email", "hohejo6745@etramay.com")'
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ Works! Found ${result.data.documents?.length || 0} documents`);
    } else {
      console.log(`   ❌ Error: ${result.data?.message}`);
    }

    // Test 4: Multiple queries with limit
    console.log('\n✅ Test 4: Multiple queries (equal + limit)');
    result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`, {
      'queries[0]': 'equal("email", "hohejo6745@etramay.com")',
      'queries[1]': 'limit(10)'
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ Works! Found ${result.data.documents?.length || 0} documents`);
      if (result.data.documents?.length > 0) {
        console.log(`   Document: ${JSON.stringify(result.data.documents[0], null, 2)}`);
      }
    } else {
      console.log(`   ❌ Error: ${result.data?.message}`);
    }

    // Test 5: Check what Query SDK actually produces (if available)
    console.log('\n✅ Test 5: Checking Appwrite SDK Query output...');
    try {
      const { Query } = require('node-appwrite');
      const q1 = Query.equal('email', 'hohejo6745@etramay.com');
      const q2 = Query.limit(10);
      const q3 = Query.orderDesc('created_at');
      
      console.log(`   Query.equal() produces: ${q1}`);
      console.log(`   Query.limit() produces: ${q2}`);
      console.log(`   Query.orderDesc() produces: ${q3}`);

      // Test with SDK-generated queries
      result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`, {
        'queries[0]': q1,
        'queries[1]': q2
      });
      console.log(`\n   Testing with SDK-generated queries...`);
      console.log(`   Status: ${result.status}`);
      if (result.status === 200) {
        console.log(`   ✅ Works! Found ${result.data.documents?.length || 0} documents`);
      } else {
        console.log(`   ❌ Error: ${result.data?.message}`);
      }
    } catch (err) {
      console.log(`   node-appwrite not installed or error: ${err.message}`);
      console.log(`   Installing node-appwrite to test...`);
      // Don't fail here, continue with other tests
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Query Format Testing Complete\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run with timeout
setTimeout(() => {
  console.error('❌ Request timeout');
  process.exit(1);
}, 60000);

testQueryFormats();
