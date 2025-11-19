const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '691cc78f002782a96b55';
const DATABASE_ID = 'freshmart';
const API_KEY = 'standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05';

async function apiCall(method, endpoint, data = null) {
  const url = `${APPWRITE_ENDPOINT}${endpoint}`;
  const options = {
    method,
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const text = await response.text();
  
  let result = {};
  try {
    result = JSON.parse(text);
  } catch (e) {
    result = { message: text };
  }

  if (!response.ok) {
    const error = new Error(result.message || `API Error: ${response.status}`);
    error.response = { status: response.status, data: result };
    throw error;
  }

  return result;
}

// Admin email to farmer mapping
const adminRoles = [
  {
    email: 'yakoge2234@gusronk.com',
    farmer_id: '691d71728aae9e02a5a7',
    farm_name: 'Yakoge Premium Farm',
  },
  {
    email: 'vineethkumar45677@gmail.com',
    farmer_id: '691d7173228d6f9d54a0',
    farm_name: 'Green Valley Farms',
  },
  {
    email: 'vineethedits01@gmail.com',
    farmer_id: '691d7173bc793e81f6e0',
    farm_name: 'Fresh Harvest Co.',
  },
];

async function setupAdminRoles() {
  try {
    console.log('🔧 Setting up admin roles...\n');

    // Step 1: Create admin_roles collection
    console.log('📋 Creating admin_roles collection...');
    let collectionId;
    
    try {
      const collectionResponse = await apiCall(
        'POST',
        `/databases/${DATABASE_ID}/collections`,
        {
          collectionId: 'unique()',
          name: 'admin_roles',
          permissions: [],
          documentSecurity: false,
        }
      );
      console.log('✅ Collection created:', collectionResponse.name);
      collectionId = collectionResponse.$id;

      // Step 2: Create attributes for the collection
      console.log('\n📝 Creating collection attributes...');

      const attributes = [
        {
          type: 'string',
          key: 'email',
          required: true,
          array: false,
        },
        {
          type: 'string',
          key: 'farmer_id',
          required: true,
          array: false,
        },
        {
          type: 'string',
          key: 'farm_name',
          required: true,
          array: false,
        },
      ];

      for (const attr of attributes) {
        try {
          await apiCall(
            'POST',
            `/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${attr.type}`,
            attr
          );
          console.log(`  ✅ Created attribute: ${attr.key}`);
        } catch (err) {
          console.log(`  ⚠️ Attribute ${attr.key} might already exist`);
        }
      }

      // Step 3: Create unique index on email
      console.log('\n🔑 Creating unique index on email...');
      try {
        await apiCall(
          'POST',
          `/databases/${DATABASE_ID}/collections/${collectionId}/indexes`,
          {
            key: 'unique_email',
            type: 'unique',
            attributes: ['email'],
          }
        );
        console.log('  ✅ Unique index created on email');
      } catch (err) {
        console.log('  ⚠️ Index might already exist');
      }

      // Step 4: Populate with admin roles
      console.log('\n➕ Adding admin role assignments...');
      for (const role of adminRoles) {
        try {
          await apiCall(
            'POST',
            `/databases/${DATABASE_ID}/collections/${collectionId}/documents`,
            {
              documentId: 'unique()',
              data: {
                email: role.email,
                farmer_id: role.farmer_id,
                farm_name: role.farm_name,
              },
            }
          );
          console.log(
            `  ✅ ${role.email} → ${role.farm_name} (${role.farmer_id})`
          );
        } catch (err) {
          if (err.response?.status === 409) {
            console.log(
              `  ⚠️ ${role.email} already exists (skipping duplicate)`
            );
          } else {
            console.error(`  ❌ Error adding ${role.email}:`, err.message);
          }
        }
      }

      console.log('\n✅ Admin roles setup complete!');
      console.log('\n📊 Summary:');
      adminRoles.forEach((role) => {
        console.log(`  • ${role.email} → ${role.farm_name}`);
      });
    } catch (err) {
      if (err.response?.status === 409) {
        console.log('⚠️ Collection already exists, populating with admin roles...\n');

        // If collection exists, just add the documents
        const collections = await apiCall(
          'GET',
          `/databases/${DATABASE_ID}/collections`
        );
        const adminRolesCollection = collections.collections.find(
          (c) => c.name === 'admin_roles'
        );

        if (adminRolesCollection) {
          collectionId = adminRolesCollection.$id;
          console.log('📝 Adding admin role assignments...');
          for (const role of adminRoles) {
            try {
              await apiCall(
                'POST',
                `/databases/${DATABASE_ID}/collections/${collectionId}/documents`,
                {
                  documentId: 'unique()',
                  data: {
                    email: role.email,
                    farmer_id: role.farmer_id,
                    farm_name: role.farm_name,
                  },
                }
              );
              console.log(
                `  ✅ ${role.email} → ${role.farm_name}`
              );
            } catch (docErr) {
              if (docErr.response?.status === 409) {
                console.log(
                  `  ⚠️ ${role.email} already exists (skipping)`
                );
              } else {
                console.error(`  ❌ Error: ${docErr.message}`);
              }
            }
          }

          console.log('\n✅ Admin roles setup complete!');
          console.log('\n📊 Summary:');
          adminRoles.forEach((role) => {
            console.log(`  • ${role.email} → ${role.farm_name}`);
          });
        }
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Error during setup:', error.response?.data || error.message);
    process.exit(1);
  }
}

setupAdminRoles();
