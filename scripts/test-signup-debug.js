#!/usr/bin/env node

/**
 * Test signup API with detailed error logging
 */

const http = require('http');

async function testSignup() {
  const email = `test_${Date.now()}@example.com`;
  const payload = {
    email,
    password: 'TestPass@123',
    name: 'Test User'
  };

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('\n🧪 TESTING SIGNUP API\n');
    console.log('=' .repeat(60));
    console.log('📍 Endpoint: POST http://localhost:3000/api/auth/signup');
    console.log('📝 Payload:', JSON.stringify(payload, null, 2));

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log(`\n✅ Status: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        console.log(`📄 Response body:`);
        try {
          const parsed = JSON.parse(body);
          console.log(JSON.stringify(parsed, null, 2));
        } catch {
          console.log(body);
        }
        console.log('\n' + '='.repeat(60));
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      console.log('\n' + '='.repeat(60));
      resolve();
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

testSignup();
