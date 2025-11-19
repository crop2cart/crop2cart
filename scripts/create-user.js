#!/usr/bin/env node

/**
 * Appwrite Create User Script
 * Creates a single user in the Appwrite database
 * 
 * Run: node scripts/create-user.js
 */

const https = require('https');
const crypto = require('crypto');

const APPWRITE_ENDPOINT = 'cloud.appwrite.io';
const APPWRITE_PROJECT_ID = '691cc78f002782a96b55';
const APPWRITE_API_KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';
const DATABASE_ID = 'freshmart';
const COLLECTION_ID = 'users';
const PASSWORD_SALT = '75bba28f7ea2ab8dcd6896cd4382270ec891032778698d3f746cd22ff9664a0c';

// User credentials
const USER_EMAIL = 'hohejo6745@etramay.com';
const USER_PASSWORD = 'Varshu@1234';
const USER_NAME = 'Varshu';

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
        if (res.statusCode >= 400) {
          try {
            const errorData = JSON.parse(body);
            reject(new Error(`${res.statusCode}: ${errorData.message || body}`));
          } catch {
            reject(new Error(`${res.statusCode}: ${body}`));
          }
        } else {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ success: true });
          }
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

async function createUser() {
  try {
    console.log('\n🚀 Starting user creation...\n');

    // Hash password
    const hashedPassword = crypto
      .createHash('sha256')
      .update(USER_PASSWORD + PASSWORD_SALT)
      .digest('hex');

    console.log('📝 User Details:');
    console.log(`   Email: ${USER_EMAIL}`);
    console.log(`   Name: ${USER_NAME}`);
    console.log(`   Password: ${USER_PASSWORD}`);
    console.log(`   Hashed Password: ${hashedPassword.substring(0, 16)}...\n`);

    // Get current Unix timestamp
    const now = new Date();
    const unixTimestamp = Math.floor(now.getTime() / 1000);

    console.log('📦 Creating user in Appwrite...');
    
    const userResult = await makeRequest(
      'POST',
      `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`,
      {
        documentId: crypto.randomUUID(),
        data: {
          email: USER_EMAIL,
          password: hashedPassword,
          name: USER_NAME,
          phone: '',
          avatar_url: '',
          status: 'active',
          created_at: unixTimestamp,
          updated_at: unixTimestamp,
          last_login: unixTimestamp,
        },
      }
    );

    console.log('✅ User created successfully!\n');
    console.log('📊 User Document:');
    console.log(`   Document ID: ${userResult.$id}`);
    console.log(`   Email: ${userResult.email}`);
    console.log(`   Name: ${userResult.name}`);
    console.log(`   Status: ${userResult.status}`);
    console.log(`   Created At: ${new Date(userResult.created_at * 1000).toISOString()}\n`);

    console.log('✨ User creation completed!\n');
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${USER_EMAIL}`);
    console.log(`   Password: ${USER_PASSWORD}\n`);

  } catch (error) {
    console.error('❌ User creation failed:', error.message);
    process.exit(1);
  }
}

// Run with timeout
setTimeout(() => {
  console.error('❌ Request timeout');
  process.exit(1);
}, 30000);

createUser();
