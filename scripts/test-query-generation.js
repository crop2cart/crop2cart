#!/usr/bin/env node

/**
 * Test the appwrite.ts query format directly
 */

const { Query } = require('appwrite');

// Simulate the getServerAppwrite function
function testQueryGeneration() {
  console.log('\n🔍 TESTING QUERY GENERATION IN APPWRITE.TS\n');
  console.log('=' .repeat(60));

  // Test data that will be passed to listDocuments
  const testQueries = [
    { method: 'equal', attribute: 'email', value: 'test@example.com' }
  ];

  console.log('\n📝 Input query object:');
  console.log(JSON.stringify(testQueries[0], null, 2));

  // Simulate the query string generation from appwrite.ts
  const queryStrings = testQueries.map((q) => {
    if (typeof q === 'string') {
      return q;
    }
    if (q.method === 'equal') {
      return JSON.stringify({
        method: 'equal',
        attribute: q.attribute,
        values: Array.isArray(q.value) ? q.value : [q.value]
      });
    }
    return '';
  }).filter(q => q);

  console.log('\n📤 Generated query string:');
  console.log(queryStrings[0]);

  // Test URL encoding
  const queryParams = queryStrings
    .map((queryStr, index) => `queries[${index}]=${encodeURIComponent(queryStr)}`)
    .join('&');

  console.log('\n🔗 URL query parameter:');
  console.log(queryParams);

  console.log('\n📖 Decoded back:');
  console.log(decodeURIComponent(queryParams.split('=')[1]));

  // Compare with SDK Query.equal output
  const sdkQuery = Query.equal('email', 'test@example.com');
  console.log('\n🎯 SDK Query.equal() output:');
  console.log(sdkQuery);

  console.log('\n✅ Match:', queryStrings[0] === sdkQuery ? '✓ YES' : '✗ NO');

  console.log('\n' + '='.repeat(60));
}

testQueryGeneration();
