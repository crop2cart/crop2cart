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

async function checkProduct() {
  const listPath = `/databases/${DATABASE_ID}/collections/yakoge_products/documents?limit=1`;
  const response = await makeRequest("GET", listPath);
  const product = response.documents[0];
  console.log("Sample product:", JSON.stringify(product, null, 2));
}

checkProduct().catch(console.error);
