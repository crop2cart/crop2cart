#!/usr/bin/env node

/**
 * Test signup API with corrected query format
 */

const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
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

async function testSignup() {
  try {
    console.log('\n🧪 TESTING SIGNUP WITH CORRECTED QUERY FORMAT\n');
    console.log('=' .repeat(60));

    // Generate unique email
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;

    console.log(`\n📝 Test 1: Signup with new email`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: TestPass@123`);

    const result = await makeRequest('POST', '/api/auth/signup', {
      email: email,
      password: 'TestPass@123',
      name: 'Test User'
    });

    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));

    if (result.status === 200 || result.status === 201) {
      console.log(`\n✅ SUCCESS! Signup works with corrected query format`);
    } else {
      console.log(`\n❌ Signup failed`);
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSignup();
