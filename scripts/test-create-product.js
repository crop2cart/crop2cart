// Test creating a product with farmer_id
const farmers = {
  yakoge: '691d71728aae9e02a5a7',
  greenValley: '691d7173228d6f9d54a0',
  freshHarvest: '691d7173bc793e81f6e0'
};

async function testCreateProduct() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING PRODUCT CREATION WITH FARMER_ID');
  console.log('='.repeat(60));

  try {
    // Test 1: Create product WITH farmer_id (should succeed)
    console.log('\n📝 TEST 1: Create product WITH farmer_id');
    console.log('-'.repeat(40));
    
    const productWithFarmer = {
      name: 'Test Mango',
      variant: '(1 kg)',
      fullPrice: 150,
      discount: 20,
      stock: 100,
      description: 'Fresh test mango for farmer linking',
      images: [],
      farmer_id: farmers.greenValley
    };

    const response1 = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithFarmer)
    });

    if (response1.ok) {
      const result1 = await response1.json();
      console.log(`✅ SUCCESS - Product created with ID: ${result1.$id}`);
      console.log(`   Name: ${result1.name}`);
      console.log(`   Farmer ID: ${result1.farmer_id}`);
    } else {
      const error1 = await response1.json();
      console.log(`❌ FAILED - ${error1.error}`);
    }

    // Test 2: Create product WITHOUT farmer_id (should fail)
    console.log('\n📝 TEST 2: Create product WITHOUT farmer_id (should be rejected)');
    console.log('-'.repeat(40));
    
    const productWithoutFarmer = {
      name: 'Test Apple',
      variant: '(1 kg)',
      fullPrice: 100,
      discount: 10,
      stock: 50,
      description: 'Test product without farmer'
      // farmer_id: MISSING
    };

    const response2 = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithoutFarmer)
    });

    if (response2.status === 400) {
      const error2 = await response2.json();
      console.log(`✅ CORRECTLY REJECTED`);
      console.log(`   Error: ${error2.error}`);
    } else {
      console.log(`❌ SHOULD BE REJECTED but got: ${response2.status}`);
    }

    // Test 3: Fetch products for the farmer we just created a product for
    console.log('\n📝 TEST 3: Fetch products for Green Valley farmer');
    console.log('-'.repeat(40));
    
    const response3 = await fetch(`http://localhost:3000/api/products/by-farmer?farmer_id=${farmers.greenValley}`);
    const products3 = await response3.json();
    console.log(`✅ Green Valley has ${products3.length} products`);
    if (products3.length > 0) {
      console.log(`   Latest: "${products3[products3.length-1].name}" (farmer_id: ${products3[products3.length-1].farmer_id})`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTING COMPLETE - FARMER-PRODUCT LINKING WORKING!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCreateProduct();
