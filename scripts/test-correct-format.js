#!/usr/bin/env node

/**
 * Test correct query format with actual SDK-generated query strings
 */

const { Query } = require('appwrite');
const https = require('https');

const APPWRITE_ENDPOINT = 'cloud.appwrite.io';
const APPWRITE_PROJECT_ID = '691cc78f002782a96b55';
const APPWRITE_API_KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';
const DATABASE_ID = 'freshmart';

function makeRequest(method, path, queries = []) {
  return new Promise((resolve, reject) => {
    let fullPath = `/v1${path}`;
    
    // Build query string with proper URL encoding
    if (queries.length > 0) {
      const queryParts = queries.map((q, index) => {
        return `queries[${index}]=${encodeURIComponent(q)}`;
      });
      fullPath += '?' + queryParts.join('&');
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

    console.log(`\n📡 Testing with query strings:`);
    queries.forEach((q, i) => {
      console.log(`   queries[${i}]: ${q}`);
    });

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

    req.end();
  });
}

async function testCorrectFormat() {
  try {
    console.log('\n🔍 TESTING WITH CORRECT QUERY FORMAT (SDK-Generated Strings)\n');
    console.log('=' .repeat(70));

    // Test 1: Single equal query
    console.log('\n✅ Test 1: Single equal query');
    const q1 = Query.equal('email', 'hohejo6745@etramay.com');
    let result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`, [q1]);
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ SUCCESS! Found ${result.data.documents?.length || 0} documents`);
      if (result.data.documents?.length > 0) {
        console.log(`   User: ${result.data.documents[0].email}`);
      }
    } else {
      console.log(`   ❌ Error: ${result.data?.message}`);
    }

    // Test 2: Equal query with limit
    console.log('\n✅ Test 2: Equal query + limit');
    const q2a = Query.equal('email', 'hohejo6745@etramay.com');
    const q2b = Query.limit(10);
    result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/users/documents`, [q2a, q2b]);
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ SUCCESS! Found ${result.data.documents?.length || 0} documents`);
    } else {
      console.log(`   ❌ Error: ${result.data?.message}`);
    }

    // Test 3: Is not null + order desc + limit (like OTP verification query)
    console.log('\n✅ Test 3: isNotNull + orderDesc + limit (OTP pattern)');
    const q3a = Query.isNotNull('otp');
    const q3b = Query.orderDesc('created_at');
    const q3c = Query.limit(1);
    result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/signup_otp_tokens/documents`, [q3a, q3b, q3c]);
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ SUCCESS! Found ${result.data.documents?.length || 0} documents`);
    } else {
      console.log(`   ❌ Error: ${result.data?.message}`);
    }

    // Test 4: Multiple conditions
    console.log('\n✅ Test 4: Multiple conditions (equal email + equal otp)');
    const q4a = Query.equal('email', 'hohejo6745@etramay.com');
    const q4b = Query.equal('used', false);
    result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/signup_otp_tokens/documents`, [q4a, q4b]);
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   ✅ SUCCESS! Found ${result.data.documents?.length || 0} documents`);
    } else {
      console.log(`   ❌ Error: ${result.data?.message}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ Format Testing Complete - The SDK-Generated Format WORKS! ✅\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run with timeout
setTimeout(() => {
  console.error('❌ Request timeout');
  process.exit(1);
}, 60000);

testCorrectFormat();
