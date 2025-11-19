#!/usr/bin/env node

/**
 * Test what Appwrite Query class actually generates
 */

const { Query } = require('appwrite');

console.log('\n🔍 APPWRITE QUERY CLASS OUTPUT\n');
console.log('=' .repeat(60));

// Test different query types
console.log('\nQuery.equal("email", "test@example.com")');
const q1 = Query.equal('email', 'test@example.com');
console.log(`Output: ${q1}`);
console.log(`Type: ${typeof q1}`);

console.log('\nQuery.limit(10)');
const q2 = Query.limit(10);
console.log(`Output: ${q2}`);

console.log('\nQuery.offset(0)');
const q3 = Query.offset(0);
console.log(`Output: ${q3}`);

console.log('\nQuery.orderDesc("created_at")');
const q4 = Query.orderDesc('created_at');
console.log(`Output: ${q4}`);

console.log('\nQuery.isNotNull("email")');
const q5 = Query.isNotNull('email');
console.log(`Output: ${q5}`);

console.log('\n' + '='.repeat(60));
console.log('\n✨ Query class generates these strings to send to REST API\n');
