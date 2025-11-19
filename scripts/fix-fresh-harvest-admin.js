const API = 'https://cloud.appwrite.io/v1';
const PROJECT = '691cc78f002782a96b55';
const DB = 'freshmart';
const KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';

const FRESH_HARVEST_EMAIL = 'teetlavarshubodisattva@gmail.com';
const FRESH_HARVEST_USER_ID = '691d98b2a838c4647f'; // From diagnostic output

async function fixFreshHarvestAdmin() {
  console.log('🔧 FIXING FRESH HARVEST ADMIN ROLE\n');
  console.log(`📧 Email: ${FRESH_HARVEST_EMAIL}`);
  console.log(`📋 User ID: ${FRESH_HARVEST_USER_ID}\n`);
  
  try {
    // Get collections
    const collectionsRes = await fetch(`${API}/databases/${DB}/collections`, {
      headers: {
        'X-Appwrite-Project': PROJECT,
        'X-Appwrite-Key': KEY,
      }
    });
    const collectionsData = await collectionsRes.json();
    const usersCollection = collectionsData.collections?.find(c => c.name === 'users');
    
    if (!usersCollection) {
      console.error('❌ Users collection not found!');
      return;
    }
    
    console.log('📋 Step 1: Fetching user document...\n');
    
    // Fetch the user directly by ID
    const userRes = await fetch(
      `${API}/databases/${DB}/collections/${usersCollection.$id}/documents/${FRESH_HARVEST_USER_ID}`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': KEY,
        }
      }
    );
    
    if (!userRes.ok) {
      const error = await userRes.json();
      console.error('❌ Failed to fetch user:', error);
      return;
    }
    
    const user = await userRes.json();
    console.log(`✅ Found user: ${user.$id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role || 'N/A'}`);
    console.log(`   Current isAdmin: ${user.isAdmin || false}\n`);
    
    console.log('🔄 Step 2: Updating user document...\n`);
    
    // Update the user
    const updateRes = await fetch(
      `${API}/databases/${DB}/collections/${usersCollection.$id}/documents/${user.$id}`,
      {
        method: 'PATCH',
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'admin',
          isAdmin: true,
        })
      }
    );
    
    if (!updateRes.ok) {
      const error = await updateRes.json();
      console.error('❌ Update failed:', error);
      return;
    }
    
    const updatedUser = await updateRes.json();
    console.log('✅ User document updated successfully!');
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   New isAdmin: ${updatedUser.isAdmin}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ VERIFICATION - USER AFTER UPDATE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Verify the update
    const verifyRes = await fetch(
      `${API}/databases/${DB}/collections/${usersCollection.$id}/documents?queries[]=equal("email","${FRESH_HARVEST_EMAIL}")`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': KEY,
        }
      }
    );
    const verifyData = await verifyRes.json();
    const verifiedUser = verifyData.documents[0];
    
    console.log(`Email: ${verifiedUser.email}`);
    console.log(`Role: ${verifiedUser.role}`);
    console.log(`isAdmin: ${verifiedUser.isAdmin}`);
    console.log(`Created: ${verifiedUser.created_at || 'N/A'}`);
    console.log(`Updated: ${verifiedUser.updated_at || 'N/A'}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DONE! Fresh Harvest admin fixed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Next steps:');
    console.log('   1. Clear browser cache/localStorage');
    console.log('   2. Log out and log back in');
    console.log('   3. Admin button should now appear!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixFreshHarvestAdmin();
