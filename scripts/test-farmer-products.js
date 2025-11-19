// Test API endpoints for farmer-product linking
const BASE_URL = 'http://localhost:3001';

const farmers = [
  { name: 'Yakoge Premium Farm', id: '691d71728aae9e02a5a7' },
  { name: 'Green Valley Farms', id: '691d7173228d6f9d54a0' },
  { name: 'Fresh Harvest Co.', id: '691d7173bc793e81f6e0' }
];

async function testAPIs() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING FARMER-PRODUCT LINKING');
  console.log('='.repeat(60));

  try {
    // Test 1: Fetch all products
    console.log('\n📊 TEST 1: Fetch all products');
    console.log('-'.repeat(40));
    const allResponse = await fetch(`${BASE_URL}/api/products`);
    const allData = await allResponse.json();
    console.log(`✓ Total products in database: ${allData.data?.length || 0}`);
    
    if (allData.data && allData.data.length > 0) {
      const first = allData.data[0];
      console.log(`  First product: "${first.name}"`);
      console.log(`  Has farmer_id: ${first.farmer_id ? '✅ YES' : '❌ NO'}`);
      if (first.farmer_id) {
        const farmer = farmers.find(f => f.id === first.farmer_id);
        console.log(`  Assigned to: ${farmer ? farmer.name : 'UNKNOWN FARMER'}`);
      }
    }

    // Test 2: Fetch products for each farmer
    console.log('\n📊 TEST 2: Fetch products by farmer');
    console.log('-'.repeat(40));
    
    for (const farmer of farmers) {
      const response = await fetch(`${BASE_URL}/api/products/by-farmer?farmer_id=${farmer.id}`);
      const products = await response.json();
      const count = Array.isArray(products) ? products.length : 0;
      console.log(`✓ ${farmer.name}`);
      console.log(`  Products: ${count}`);
      if (count > 0) {
        console.log(`  Examples: ${products.slice(0, 2).map(p => `"${p.name}"`).join(', ')}`);
      }
    }

    // Test 3: Check if admin form can add farmer_id
    console.log('\n📊 TEST 3: Verify farmer_id field requirement');
    console.log('-'.repeat(40));
    
    const testPayload = {
      name: 'Test Apple',
      variant: '(1kg)',
      fullPrice: 100,
      discount: 10,
      stock: 50,
      description: 'Test product for farmer linking'
      // Missing farmer_id - should fail
    };

    const failResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const failData = await failResponse.json();
    if (failResponse.status === 400) {
      console.log(`✓ POST without farmer_id: ✅ CORRECTLY REJECTED`);
      console.log(`  Error: "${failData.error}"`);
    } else {
      console.log(`✗ POST without farmer_id: ❌ SHOULD BE REJECTED`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ API TESTING COMPLETE');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPIs();
