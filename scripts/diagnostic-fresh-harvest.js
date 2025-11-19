const API = 'https://cloud.appwrite.io/v1';
const PROJECT = '691cc78f002782a96b55';
const DB = 'freshmart';
const KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';

const FRESH_HARVEST_EMAIL = 'teetlavarshubodisattva@gmail.com';
const FRESH_HARVEST_FARMER_ID = '691d7173bc793e81f6e0';

async function diagnostic() {
  console.log('🔍 DIAGNOSTIC CHECK FOR FRESH HARVEST ADMIN\n');
  console.log(`📧 Email: ${FRESH_HARVEST_EMAIL}`);
  console.log(`🏠 Farmer ID: ${FRESH_HARVEST_FARMER_ID}\n`);
  
  try {
    // Get collections first
    const collectionsRes = await fetch(`${API}/databases/${DB}/collections`, {
      headers: {
        'X-Appwrite-Project': PROJECT,
        'X-Appwrite-Key': KEY,
      }
    });
    const collectionsData = await collectionsRes.json();
    
    const usersCollection = collectionsData.collections?.find(c => c.name === 'users');
    const adminRolesCollection = collectionsData.collections?.find(c => c.name === 'admin_roles');
    
    if (!usersCollection || !adminRolesCollection) {
      console.error('❌ Required collections not found!');
      return;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  CHECKING USERS COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Check if user exists in users collection
    const userRes = await fetch(
      `${API}/databases/${DB}/collections/${usersCollection.$id}/documents?queries[]=equal("email","${FRESH_HARVEST_EMAIL}")`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': KEY,
        }
      }
    );
    const userData = await userRes.json();
    
    if (userData.documents && userData.documents.length > 0) {
      const user = userData.documents[0];
      console.log('✅ User found in users collection!');
      console.log(`   • ID: ${user.$id}`);
      console.log(`   • Email: ${user.email}`);
      console.log(`   • Name: ${user.name || 'N/A'}`);
      console.log(`   • Role: ${user.role || 'N/A'}`);
      console.log(`   • isAdmin: ${user.isAdmin || false}`);
      console.log(`   • Password: ${user.password ? '✅ Set' : '❌ Not set'}`);
      console.log(`   • Created: ${user.created_at || 'N/A'}`);
      
      // Check for issues
      console.log('\n🔎 ISSUE CHECK:');
      if (!user.role) {
        console.log('   ⚠️  Role is missing or undefined');
      } else if (user.role !== 'admin') {
        console.log(`   ⚠️  Role is "${user.role}" but should be "admin"`);
      } else {
        console.log('   ✅ Role is correctly set to "admin"');
      }
      
      if (!user.isAdmin) {
        console.log('   ⚠️  isAdmin is false but should be true');
      } else {
        console.log('   ✅ isAdmin is correctly set to true');
      }
    } else {
      console.log(`❌ User NOT found in users collection!`);
      console.log(`   This email was either not signed up or not found in database.`);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  CHECKING ADMIN_ROLES COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Check if email exists in admin_roles
    const adminRes = await fetch(
      `${API}/databases/${DB}/collections/${adminRolesCollection.$id}/documents?queries[]=equal("email","${FRESH_HARVEST_EMAIL}")`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': KEY,
        }
      }
    );
    const adminData = await adminRes.json();
    
    if (adminData.documents && adminData.documents.length > 0) {
      const adminRole = adminData.documents[0];
      console.log('✅ Admin role found in admin_roles collection!');
      console.log(`   • ID: ${adminRole.$id}`);
      console.log(`   • Email: ${adminRole.email}`);
      console.log(`   • Farmer ID: ${adminRole.farmer_id}`);
      console.log(`   • Farm Name: ${adminRole.farm_name || 'N/A'}`);
      
      console.log('\n🔎 FARMER ID CHECK:');
      if (adminRole.farmer_id === FRESH_HARVEST_FARMER_ID) {
        console.log(`   ✅ Farmer ID matches Fresh Harvest (${FRESH_HARVEST_FARMER_ID})`);
      } else {
        console.log(`   ⚠️  Farmer ID is ${adminRole.farmer_id} but should be ${FRESH_HARVEST_FARMER_ID}`);
      }
    } else {
      console.log(`❌ Admin role NOT found in admin_roles collection!`);
      console.log(`   This email is missing from admin_roles mapping.`);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ALL ADMIN ROLES IN APPWRITE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allAdminRes = await fetch(
      `${API}/databases/${DB}/collections/${adminRolesCollection.$id}/documents?limit=100`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': KEY,
        }
      }
    );
    const allAdminData = await allAdminRes.json();
    
    if (allAdminData.documents && allAdminData.documents.length > 0) {
      allAdminData.documents.forEach((doc, idx) => {
        console.log(`${idx + 1}. ${doc.email}`);
        console.log(`   Farmer ID: ${doc.farmer_id}`);
        console.log(`   Farm Name: ${doc.farm_name}`);
        console.log('');
      });
    } else {
      console.log('❌ No admin roles found!');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ALL USERS IN DATABASE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allUsersRes = await fetch(
      `${API}/databases/${DB}/collections/${usersCollection.$id}/documents?limit=100`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': KEY,
        }
      }
    );
    const allUsersData = await allUsersRes.json();
    
    if (allUsersData.documents && allUsersData.documents.length > 0) {
      console.log(`Total users: ${allUsersData.total}\n`);
      allUsersData.documents.forEach((doc, idx) => {
        console.log(`${idx + 1}. ${doc.email}`);
        console.log(`   Role: ${doc.role || 'N/A'}`);
        console.log(`   isAdmin: ${doc.isAdmin || false}`);
        console.log('');
      });
    } else {
      console.log('❌ No users found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

diagnostic();
