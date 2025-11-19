#!/usr/bin/env node

/**
 * Test Appwrite update document REST API format
 */

const https = require('https');

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

async function testUpdateFormat() {
  try {
    console.log('\n🔍 TESTING APPWRITE UPDATE DOCUMENT FORMAT\n');
    console.log('=' .repeat(60));

    // Get a document to update
    console.log('\n✅ Step 1: Finding OTP documents to test update');
    let result = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/signup_otp_tokens/documents`);
    
    if (result.status === 200 && result.data.documents?.length > 0) {
      const doc = result.data.documents[0];
      const docId = doc.$id;
      console.log(`   Found document: ${docId}`);
      console.log(`   Current used value: ${doc.used}`);

      // Test PATCH with correct format (wrapped in 'data')
      console.log(`\n✅ Step 2: Testing PATCH update with { data: {...} } format`);
      result = await makeRequest('PATCH', `/databases/${DATABASE_ID}/collections/signup_otp_tokens/documents/${docId}`, {
        data: {
          used: true,
          verified_at: Math.floor(Date.now() / 1000)
        }
      });

      console.log(`   Status: ${result.status}`);
      if (result.status === 200) {
        console.log(`   ✅ SUCCESS! Document updated`);
        console.log(`   Updated used to: ${result.data.used}`);
      } else {
        console.log(`   ❌ Error: ${result.data?.message}`);
      }
    } else {
      console.log(`   No OTP documents found to test`);
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpdateFormat();
