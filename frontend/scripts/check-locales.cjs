const fs = require('fs');
const path = require('path');

const thLocalePath = path.join(__dirname, '../src/locales/th/translation.json');

try {
  const content = fs.readFileSync(thLocalePath, 'utf8');
  const data = JSON.parse(content);
  
  // Regex that matches parentheses containing English alphabet letters
  const regex = /\([^)]*[a-zA-Z][^)]*\)/;
  let errors = [];
  
  function checkObject(obj, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        checkObject(obj[key], fullKey);
      } else if (typeof obj[key] === 'string') {
        // Strip out i18next placeholder variables like {{count}} or {{days}} before checking
        const cleanedValue = obj[key].replace(/\{\{[^}]+\}\}/g, '');
        if (regex.test(cleanedValue)) {
          errors.push({ key: fullKey, value: obj[key] });
        }
      }
    }
  }
  
  checkObject(data);
  
  if (errors.length > 0) {
    console.error('\x1b[31m[ERROR] Found English characters in parentheses inside th/translation.json:\x1b[0m');
    errors.forEach(err => {
      console.error(`  - \x1b[33m${err.key}\x1b[0m: "${err.value}"`);
    });
    process.exit(1);
  } else {
    console.log('\x1b[32m[SUCCESS] Locale validation passed. No parenthesized English text found in Thai translations.\x1b[0m');
    process.exit(0);
  }
} catch (err) {
  console.error('[ERROR] Failed to run locale check:', err);
  process.exit(1);
}
