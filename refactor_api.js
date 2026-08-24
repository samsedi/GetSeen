const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api');

const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts') && f !== 'client.ts');

files.forEach(file => {
    const filePath = path.join(apiDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Array mapping: response.data.data.something.map -> (response?.data?.data?.something || []).map
    // Using a regex to catch array maps specifically:
    // Matches: response.data.data.wishlist.map
    content = content.replace(/response\.data\.data\.([a-zA-Z0-9_]+)\.map/g, '(response?.data?.data?.$1 || []).map');
    content = content.replace(/response\.data\.([a-zA-Z0-9_]+)\.map/g, '(response?.data?.$1 || []).map');

    // 2. Safe deeply nested properties: response.data.data.property -> response?.data?.data?.property
    // e.g. return response.data.data.user;
    content = content.replace(/response\.data\.data\.([a-zA-Z0-9_]+)/g, 'response?.data?.data?.$1');

    // 3. Safe response.data.data -> response?.data?.data
    content = content.replace(/response\.data\.data/g, 'response?.data?.data');

    // 4. Safe response.data.property -> response?.data?.property
    content = content.replace(/response\.data\.([a-zA-Z0-9_]+)/g, 'response?.data?.$1');

    // 5. Cleanup overlapping optional chaining (e.g. if we accidentally made response?.data?.?.data)
    content = content.replace(/\?\.\?\./g, '?.');

    // 6. Fix `throw new Error` where it's just checking data existence, replace with returning null/default
    // We'll leave this to manual/specific replacements, but let's change simple ones if possible.
    // Actually, manual is safer for throws.

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${file}`);
});
