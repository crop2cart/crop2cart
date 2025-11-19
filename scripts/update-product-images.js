const https = require("https");

const APPWRITE_ENDPOINT = "cloud.appwrite.io";
const APPWRITE_PROJECT_ID = "691cc78f002782a96b55";
const APPWRITE_API_KEY =
  "standard_1cffc6a58134b366b830e3ff27562b4b9bb5025c0b1626ab19f0e11e2398420235a6b32e38ac545a46f5c9f1b9ddc35a41a6ae1dc2d7f45c7b060b4364a55c522965a121152ad4991262cefc4cb1c3f86f2912700568132f07acbd71ca2764bbd00f3e91562934498eed90b76dc5417a382313f088feabf9e907b6ee0e56aa05";
const DATABASE_ID = "freshmart";

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: APPWRITE_ENDPOINT,
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,
        "X-Appwrite-Key": APPWRITE_API_KEY,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Image links mapping - product name to image URLs
const imageLinks = {
  apple: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/apple1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/apple2.jpg",
  ],
  banana: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/banana1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/banana2.jpg",
  ],
  blueberries: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/blueberries1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/blueberries2.jpg",
  ],
  dragonfruit: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/dragonfruit1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/dragonfruit2.jpg",
  ],
  grapes: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/grapes1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/grapes2.jpg",
  ],
  guava: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/guava1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/guava2.jpg",
  ],
  kiwi: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/kiwi1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/kiwi2.jpg",
  ],
  mangoes: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/mangoes1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/mangoes2.jpg",
  ],
  oranges: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/oranges1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/oranges2.jpg",
  ],
  papaya: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/papaya1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/papaya2.jpg",
  ],
  peaches: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/peaches1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/peaches2.jpg",
  ],
  pineapple: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/pineapple1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/pineapple2.jpg",
  ],
  pomegranate: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/pomegranate1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/pomegranate2.jpg",
  ],
  strawberry: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/strawberry1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/strawberry2.jpg",
  ],
  watermelon: [
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/watermelon1.jpg",
    "https://vyxumcncaunrczgxwogo.supabase.co/storage/v1/object/public/images/watermelon2.jpg",
  ],
};

// Collections to update
const collections = ["yakoge_products", "greenvalley_products", "freshharvest_products"];

async function updateProductImages() {
  console.log("📸 Starting to update product images across all farms...\n");

  for (const collectionId of collections) {
    console.log(`\n🚀 Processing collection: ${collectionId}`);
    console.log("=".repeat(60));

    try {
      // Fetch all products from the collection
      const listPath = `/databases/${DATABASE_ID}/collections/${collectionId}/documents`;
      const response = await makeRequest("GET", listPath);
      const products = response.documents || [];

      console.log(`📦 Found ${products.length} products in ${collectionId}`);

      let updatedCount = 0;
      let skippedCount = 0;

      // Update each product with matching image links
      for (const product of products) {
        const productName = product.name.toLowerCase().trim();

        // Find matching image links
        let matchedImages = null;

        // Special cases mapping
        const specialMapping = {
          "strawberries": "strawberry",
          "strawberry": "strawberry",
          "dragon fruit": "dragonfruit",
          "dragonfruit": "dragonfruit"
        };

        // Check special mapping first
        if (specialMapping[productName]) {
          const mappedName = specialMapping[productName];
          if (imageLinks[mappedName]) {
            matchedImages = imageLinks[mappedName];
          }
        }

        // If not found in special mapping, try exact match
        if (!matchedImages && imageLinks[productName]) {
          matchedImages = imageLinks[productName];
        }

        // Try partial match if still not found
        if (!matchedImages) {
          for (const [key, images] of Object.entries(imageLinks)) {
            if (
              productName.includes(key) ||
              key.includes(productName) ||
              productName.includes(key.replace("s", "")) ||
              key.includes(productName.replace("s", ""))
            ) {
              matchedImages = images;
              break;
            }
          }
        }

        if (matchedImages) {
          try {
            const updatePath = `/databases/${DATABASE_ID}/collections/${collectionId}/documents/${product.$id}`;
            
            // IMPORTANT: images must be sent as a JSON string, not an array
            // AND must be wrapped in 'data' property
            const updateData = {
              data: {
                images: JSON.stringify(matchedImages),
              }
            };

            await makeRequest("PATCH", updatePath, updateData);

            console.log(
              `✅ Updated "${product.name}" with ${matchedImages.length} images`
            );
            updatedCount++;
          } catch (updateError) {
            console.error(
              `❌ Failed to update "${product.name}":`,
              updateError.message
            );
          }
        } else {
          console.log(
            `⏭️  Skipped "${product.name}" - no matching images found`
          );
          skippedCount++;
        }
      }

      console.log(
        `\n📊 Summary for ${collectionId}:`
      );
      console.log(
        `   ✅ Updated: ${updatedCount}/${products.length}`
      );
      console.log(
        `   ⏭️  Skipped: ${skippedCount}/${products.length}`
      );
    } catch (error) {
      console.error(
        `❌ Error processing collection ${collectionId}:`,
        error.message
      );
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ Image update process completed!");
}

updateProductImages().catch(console.error);
