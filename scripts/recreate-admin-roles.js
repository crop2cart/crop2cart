const API = 'https://cloud.appwrite.io/v1';
const PROJECT = '691cc78f002782a96b55';
const DB = 'freshmart';
const KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';

async function apiCall(method, endpoint, data = null) {
  const url = `${API}${endpoint}`;
  const options = {
    method,
    headers: {
      'X-Appwrite-Project': PROJECT,
      'X-Appwrite-Key': KEY,
      'Content-Type': 'application/json',
    },
  };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(url, options);
  const text = await response.text();
  
  let result = {};
  try {
    result = JSON.parse(text);
  } catch (e) {
    result = { message: text };
  }

  if (!response.ok) {
    throw { status: response.status, data: result };
  }
  return result;
}

const adminRoles = [
  { email: 'yakoge2234@gusronk.com', farmer_id: '691d71728aae9e02a5a7', farm_name: 'Yakoge Premium Farm' },
  { email: 'vineethkumar45677@gmail.com', farmer_id: '691d7173228d6f9d54a0', farm_name: 'Green Valley Farms' },
  { email: 'vineethedits01@gmail.com', farmer_id: '691d7173bc793e81f6e0', farm_name: 'Fresh Harvest Co.' },
];

async function recreateAdminRoles() {
  try {
    console.log('🔧 Recreating admin_roles collection...\n');

    // Get existing collection
    const collections = await apiCall('GET', `/databases/${DB}/collections`);
    const existing = collections.collections?.find(c => c.name === 'admin_roles');
    
    if (existing) {
      console.log('🗑️ Deleting existing collection...');
      await apiCall('DELETE', `/databases/${DB}/collections/${existing.$id}`);
      console.log('✅ Deleted\n');
    }

    // Create new collection
    console.log('📋 Creating admin_roles collection...');
    const collection = await apiCall('POST', `/databases/${DB}/collections`, {
      collectionId: 'unique()',
      name: 'admin_roles',
    });
    const collectionId = collection.$id;
    console.log('✅ Created:', collectionId);

    // Add attributes with proper format
    console.log('\n📝 Creating attributes...');
    const attributes = [
      { key: 'email', type: 'string', required: true, array: false, size: 255 },
      { key: 'farmer_id', type: 'string', required: true, array: false, size: 255 },
      { key: 'farm_name', type: 'string', required: true, array: false, size: 255 },
    ];

    for (const attr of attributes) {
      try {
        await apiCall('POST', `/databases/${DB}/collections/${collectionId}/attributes/string`, {
          key: attr.key,
          required: attr.required,
          array: attr.array,
          size: attr.size,
        });
        console.log(`  ✅ ${attr.key}`);
      } catch (err) {
        console.error(`  ❌ ${attr.key}:`, err.data?.message || err);
      }
    }

    // Create index
    console.log('\n🔑 Creating unique index on email...');
    try {
      await apiCall('POST', `/databases/${DB}/collections/${collectionId}/indexes`, {
        key: 'unique_email',
        type: 'unique',
        attributes: ['email'],
        orders: [],
      });
      console.log('✅ Index created');
    } catch (err) {
      console.error('❌', err.data?.message || err);
    }

    // Add documents
    console.log('\n➕ Adding admin role assignments...');
    for (const role of adminRoles) {
      try {
        await apiCall('POST', `/databases/${DB}/collections/${collectionId}/documents`, {
          documentId: 'unique()',
          data: {
            email: role.email,
            farmer_id: role.farmer_id,
            farm_name: role.farm_name,
          },
        });
        console.log(`  ✅ ${role.email} → ${role.farm_name}`);
      } catch (err) {
        console.error(`  ❌ ${role.email}:`, err.data?.message || err);
      }
    }

    console.log('\n✅ Admin roles setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.data?.message || error.message);
    process.exit(1);
  }
}

recreateAdminRoles();
