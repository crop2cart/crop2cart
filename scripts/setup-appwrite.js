#!/usr/bin/env node

/**
 * Appwrite Setup Script (using REST API)
 * Creates database and collections for Crop2Cart
 * 
 * Run: node scripts/setup-appwrite.js
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
        if (res.statusCode >= 400) {
          try {
            const errorData = JSON.parse(body);
            if (res.statusCode === 409) {
              resolve({ already_exists: true });
            } else {
              reject(new Error(`${res.statusCode}: ${errorData.message || body}`));
            }
          } catch {
            if (res.statusCode === 409) {
              resolve({ already_exists: true });
            } else {
              reject(new Error(`${res.statusCode}: ${body}`));
            }
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

async function setupAppwrite() {
  try {
    console.log('🚀 Starting Appwrite setup...\n');

    // Step 1: Create database
    console.log('📦 Creating database...');
    const dbResult = await makeRequest('POST', '/databases', {
      databaseId: DATABASE_ID,
      name: 'freshmart',
    });
    if (dbResult.already_exists) {
      console.log('✅ Database already exists: freshmart\n');
    } else {
      console.log('✅ Database created: freshmart\n');
    }

    // Step 2: Create 'users' collection
    console.log('👥 Creating "users" collection...');
    const usersResult = await makeRequest('POST', `/databases/${DATABASE_ID}/collections`, {
      collectionId: 'users',
      name: 'users',
      permissions: [],
    });

    if (!usersResult.already_exists) {
      console.log('  ✓ Collection created: users');
      
      const userAttrs = [
        { key: 'email', type: 'string', size: 255, required: true },
        { key: 'password', type: 'string', size: 255, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'phone', type: 'string', size: 20, required: false },
        { key: 'avatar_url', type: 'string', size: 2048, required: false },
        { key: 'status', type: 'string', size: 50, required: false, default: 'active' },
        { key: 'created_at', type: 'integer', required: true },
        { key: 'updated_at', type: 'integer', required: true },
        { key: 'last_login', type: 'integer', required: false },
      ];

      for (const attr of userAttrs) {
        try {
          if (attr.type === 'integer') {
            await makeRequest(
              'POST',
              `/databases/${DATABASE_ID}/collections/users/attributes/integer`,
              { key: attr.key, required: attr.required }
            );
          } else {
            await makeRequest(
              'POST',
              `/databases/${DATABASE_ID}/collections/users/attributes/string`,
              { key: attr.key, size: attr.size, required: attr.required, ...(attr.default && { default: attr.default }) }
            );
          }
          console.log(`  ✓ ${attr.key}`);
        } catch (err) {
          console.log(`  ⚠ ${attr.key}: ${err.message.substring(0, 50)}`);
        }
      }
    }
    console.log('✅ "users" collection ready\n');

    // Step 3: Create 'signup_otp_tokens' collection
    console.log('🔐 Creating "signup_otp_tokens" collection...');
    const otpResult = await makeRequest('POST', `/databases/${DATABASE_ID}/collections`, {
      collectionId: 'signup_otp_tokens',
      name: 'signup_otp_tokens',
      permissions: [],
    });

    if (!otpResult.already_exists) {
      console.log('  ✓ Collection created: signup_otp_tokens');
      
      const otpAttrs = [
        { key: 'email', type: 'string', size: 255, required: true },
        { key: 'otp', type: 'string', size: 6, required: true },
        { key: 'password', type: 'string', size: 255, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'created_at', type: 'integer', required: true },
        { key: 'expires_at', type: 'integer', required: true },
        { key: 'used', type: 'boolean', required: false },
        { key: 'verified_at', type: 'integer', required: false },
      ];

      for (const attr of otpAttrs) {
        try {
          if (attr.type === 'integer') {
            await makeRequest(
              'POST',
              `/databases/${DATABASE_ID}/collections/signup_otp_tokens/attributes/integer`,
              { key: attr.key, required: attr.required }
            );
          } else if (attr.type === 'boolean') {
            await makeRequest(
              'POST',
              `/databases/${DATABASE_ID}/collections/signup_otp_tokens/attributes/boolean`,
              { key: attr.key, required: attr.required }
            );
          } else {
            await makeRequest(
              'POST',
              `/databases/${DATABASE_ID}/collections/signup_otp_tokens/attributes/string`,
              { key: attr.key, size: attr.size, required: attr.required }
            );
          }
          console.log(`  ✓ ${attr.key}`);
        } catch (err) {
          console.log(`  ⚠ ${attr.key}: ${err.message.substring(0, 50)}`);
        }
      }
    }
    console.log('✅ "signup_otp_tokens" collection ready\n');

    // Step 4: Create 'user_sessions' collection
    console.log('🔑 Creating "user_sessions" collection...');
    const sessionResult = await makeRequest('POST', `/databases/${DATABASE_ID}/collections`, {
      collectionId: 'user_sessions',
      name: 'user_sessions',
      permissions: [],
    });

    if (!sessionResult.already_exists) {
      console.log('  ✓ Collection created: user_sessions');
      
      const sessionAttrs = [
        { key: 'user_id', type: 'string', size: 255, required: true },
        { key: 'jwt_token', type: 'string', size: 500, required: false },
        { key: 'ip_address', type: 'string', size: 45, required: false },
        { key: 'user_agent', type: 'string', size: 2048, required: false },
        { key: 'device_type', type: 'string', size: 50, required: false },
        { key: 'last_activity', type: 'integer', required: true },
        { key: 'expires_at', type: 'integer', required: true },
        { key: 'created_at', type: 'integer', required: true },
      ];

      for (const attr of sessionAttrs) {
        try {
          if (attr.type === 'integer') {
            await makeRequest(
              'POST',
              `/databases/${DATABASE_ID}/collections/user_sessions/attributes/integer`,
              { key: attr.key, required: attr.required }
            );
          } else {
            await makeRequest(
              'POST',
              `/databases/${DATABASE_ID}/collections/user_sessions/attributes/string`,
              { key: attr.key, size: attr.size, required: attr.required }
            );
          }
          console.log(`  ✓ ${attr.key}`);
        } catch (err) {
          console.log(`  ⚠ ${attr.key}: ${err.message.substring(0, 50)}`);
        }
      }
    }
    console.log('✅ "user_sessions" collection ready\n');

    console.log('✨ Appwrite setup completed!\n');
    console.log('📝 Database ID: freshmart');
    console.log('📝 Project ID: 691cc78f002782a96b55');
    console.log('\n✅ Collections are ready for use!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run with timeout
setTimeout(() => {
  console.error('❌ Request timeout');
  process.exit(1);
}, 30000);

setupAppwrite();
