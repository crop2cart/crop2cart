const { Client, Databases } = require('appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixFreshHarvestAdmin() {
  try {
    // Get the user document for Fresh Harvest
    const users = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      'users',
      [{ method: 'equal', attribute: 'email', value: 'teetlavarshubodisattva@gmail.com' }]
    );
    
    if (users.documents.length === 0) {
      console.log('User not found');
      return;
    }
    
    const userId = users.documents[0].$id;
    console.log('Found user:', userId);
    
    // Update role to admin
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      'users',
      userId,
      { role: 'admin', isAdmin: true }
    );
    
    console.log('✅ Fresh Harvest admin updated successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixFreshHarvestAdmin();
