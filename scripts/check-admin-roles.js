const API = 'https://cloud.appwrite.io/v1';
const PROJECT = '691cc78f002782a96b55';
const DB = 'freshmart';
const KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';

async function checkAdminRoles() {
  try {
    const res = await fetch(`${API}/databases/${DB}/collections`, {
      headers: {
        'X-Appwrite-Project': PROJECT,
        'X-Appwrite-Key': KEY,
      }
    });
    const data = await res.json();
    const collection = data.collections?.find(c => c.name === 'admin_roles');
    
    if (collection) {
      console.log('✅ Collection found:', collection.$id);
      console.log('\nAttributes:');
      collection.attributes?.forEach(a => {
        console.log(`  • ${a.key} (${a.type})`);
      });
      
      // Fetch documents
      const docsRes = await fetch(
        `${API}/databases/${DB}/collections/${collection.$id}/documents`,
        {
          headers: {
            'X-Appwrite-Project': PROJECT,
            'X-Appwrite-Key': KEY,
          }
        }
      );
      const docsData = await docsRes.json();
      console.log('\nDocuments:', docsData.total);
      docsData.documents?.forEach(doc => {
        console.log(`  • ${doc.email} → ${doc.farm_name}`);
      });
    } else {
      console.log('❌ No admin_roles collection found');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkAdminRoles();
