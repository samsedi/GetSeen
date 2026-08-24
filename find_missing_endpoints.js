const fs = require('fs');
const path = require('path');

const docText = fs.readFileSync(path.join(__dirname, 'doc.txt'), 'utf-8');

// Regex to find endpoints like "GET /advertiser/orders"
const endpointRegex = /^(GET|POST|PATCH|PUT|DELETE)\s+(\/[a-zA-Z0-9\/\-{}_]+)/gm;
let match;
const expectedEndpoints = [];

while ((match = endpointRegex.exec(docText)) !== null) {
  expectedEndpoints.push({ method: match[1], url: match[2] });
}

// Function to recursively get all TS files in api/
function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const apiFiles = getAllFiles(path.join(__dirname, 'api'));
let combinedApiCode = '';
for (const file of apiFiles) {
  combinedApiCode += fs.readFileSync(file, 'utf-8') + '\n';
}

const missingEndpoints = [];
const foundEndpoints = [];

for (const ep of expectedEndpoints) {
  // Convert URL path parameters from {id} to ${id} or similar for regex matching in code
  // The code might use string interpolation like `${ADVERTISER_CART_ROUTE}/${itemId}`
  // or strings like '/advertiser/orders'
  // So we just check if key parts of the endpoint string exist in the codebase.
  
  // Extract base route parts to search
  let urlParts = ep.url.split('/').filter(p => p && !p.startsWith('{'));
  
  // Join the parts back
  let searchStr1 = urlParts.join('/'); // e.g. "advertiser/orders"
  
  // Also checking if the exact method is being called could be hard, 
  // let's just see if the base path is mentioned anywhere in the api directory.
  // Actually, let's just do a simple check if the last 1 or 2 static path segments exist in the codebase.
  
  let isFound = false;
  if (combinedApiCode.includes(`/${searchStr1}`) || combinedApiCode.includes(`'/${searchStr1}'`) || combinedApiCode.includes(`"/${searchStr1}"`)) {
     isFound = true;
  }
  
  // Check common route variables
  if (!isFound) {
    // some routes are defined as constants
    if (ep.url.includes('/cart') && combinedApiCode.includes('ADVERTISER_CART_ROUTE')) {
        if (ep.url === '/advertiser/cart' || combinedApiCode.includes('validate-coupon') || combinedApiCode.includes('checkout')) {
            isFound = true;
        }
    }
    if (ep.url.includes('/amplify') && combinedApiCode.includes('AMPLIFY_ROUTE')) {
         isFound = true;
    }
    if (ep.url.includes('/screen-owner/screens') && combinedApiCode.includes('OWNER_SCREEN_ROUTE')) {
         isFound = true;
    }
    if (ep.url.includes('/advertiser/screens') && combinedApiCode.includes('ADVERTISER_SCREEN_ROUTE')) {
         isFound = true;
    }
  }

  // Let's do a more robust check by manually reviewing the output
  if (!isFound) {
      missingEndpoints.push(ep);
  } else {
      foundEndpoints.push(ep);
  }
}

console.log("=== LIKELY MISSING ENDPOINTS ===");
for (const ep of missingEndpoints) {
  console.log(`${ep.method} ${ep.url}`);
}

// Let's output all endpoints and let me (the AI) review them manually from the console logs.
console.log("\n=== ALL EXPECTED ENDPOINTS ===");
for (const ep of expectedEndpoints) {
  console.log(`${ep.method} ${ep.url}`);
}
