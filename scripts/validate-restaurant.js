// Staging Restaurant Validation Script
// Usage: npm run validate -- --restaurant <restaurant-slug>

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((val, index, array) => {
    if (val.startsWith('--')) {
      const key = val.slice(2);
      const nextVal = array[index + 1];
      if (nextVal && !nextVal.startsWith('--')) {
        args[key] = nextVal;
      } else {
        args[key] = true;
      }
    }
  });
  return args;
}

const args = parseArgs();

if (args.help || !args.restaurant) {
  console.log(`
Staging Restaurant Validation Script

Usage:
  npm run validate -- --restaurant <restaurant-slug>

Required:
  --restaurant <slug>     The slug of the restaurant inside staging.

Options:
  --help                  Show this help message.
  `);
  process.exit(!args.restaurant && !args.help ? 1 : 0);
}

const slug = args.restaurant;
const stagingRoot = path.resolve(__dirname, '..');
const restaurantDir = path.join(stagingRoot, 'restaurants', slug);

if (!fs.existsSync(restaurantDir)) {
  console.error(`Error: Restaurant directory does not exist at '${restaurantDir}'`);
  process.exit(1);
}

console.log(`Running validation for: ${slug}`);
console.log(`Path: ${restaurantDir}\n`);

let hasErrors = false;
const errors = [];
const warnings = [];

// 1. Validate restaurant.json
const metadataPath = path.join(restaurantDir, 'restaurant.json');
let metadata = {};
if (!fs.existsSync(metadataPath)) {
  errors.push(`Missing 'restaurant.json' metadata file.`);
  hasErrors = true;
} else {
  try {
    const rawMeta = fs.readFileSync(metadataPath, 'utf8');
    metadata = JSON.parse(rawMeta);
    console.log('✓ restaurant.json: Valid JSON format');

    // Schema checks
    const requiredKeys = ['id', 'name', 'slug', 'location', 'stage', 'status', 'currentWebsiteUrl', 'currentPublicPresenceType', 'demoRoute'];
    requiredKeys.forEach(key => {
      if (!(key in metadata)) {
        errors.push(`Metadata missing required key: '${key}'`);
        hasErrors = true;
      }
    });

    if (metadata.stage !== 'staging' && metadata.stage !== 'showcase') {
      errors.push(`Metadata 'stage' must be 'staging' or 'showcase'. Found: '${metadata.stage}'`);
      hasErrors = true;
    }

    const allowedPresenceTypes = ['website', 'facebook', 'instagram', 'opentable', 'doordash', 'ubereats', 'grubhub', 'google-business-profile', 'directory-listing', 'other', 'none'];
    if (metadata.currentPublicPresenceType && !allowedPresenceTypes.includes(metadata.currentPublicPresenceType)) {
      errors.push(`Metadata 'currentPublicPresenceType' must be one of: [${allowedPresenceTypes.join(', ')}]. Found: '${metadata.currentPublicPresenceType}'`);
      hasErrors = true;
    }

    // Review checks
    const reviewChecks = [
      'desktopReviewed', 'mobileReviewed', 'linksVerified', 'contentVerified',
      'performanceReviewed', 'accessibilityReviewed', 'comparisonButtonAdded',
      'productionBuildPassed', 'approvedForPresentation'
    ];
    reviewChecks.forEach(check => {
      if (typeof metadata[check] !== 'boolean') {
        warnings.push(`Review flag '${check}' is not a boolean.`);
      }
    });

  } catch (err) {
    errors.push(`Invalid JSON in 'restaurant.json': ${err.message}`);
    hasErrors = true;
  }
}

// Helper to gather all files in the folder
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allFiles = getFiles(restaurantDir);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

// 2. Validate HTML Files existence and count
if (htmlFiles.length === 0) {
  errors.push('No HTML files found in the restaurant folder.');
  hasErrors = true;
} else if (htmlFiles.length < 6) {
  warnings.push(`6-page standard not met. Found ${htmlFiles.length} HTML files, needs at least 6.`);
}

const hasIndexHtml = htmlFiles.some(f => path.basename(f) === 'index.html');
if (!hasIndexHtml) {
  errors.push('Missing main landing page: index.html');
  hasErrors = true;
}

// 3. Scan HTML files for placeholders and broken references
const placeholderRegexes = [
  /lorem\s+ipsum/i,
  /todo/i,
  /placeholder/i,
  /fixme/i,
  /insert\s+(here|text|details)/i,
  /\[name\]/i,
  /\[phone\]/i,
  /\[address\]/i
];

htmlFiles.forEach(htmlFile => {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const filename = path.basename(htmlFile);

  // Check placeholders
  placeholderRegexes.forEach(regex => {
    const match = content.match(regex);
    if (match) {
      warnings.push(`Placeholder text '${match[0]}' detected in '${filename}'`);
    }
  });

  // Extract links and assets to check local references
  const srcMatches = content.matchAll(/src=["'](.*?)["']/g);
  const hrefMatches = content.matchAll(/href=["'](.*?)["']/g);

  const checkRef = (ref) => {
    // Ignore external, telephone, mailto, anchor links, and environment checks
    if (
      ref.startsWith('http://') || 
      ref.startsWith('https://') || 
      ref.startsWith('//') ||
      ref.startsWith('mailto:') || 
      ref.startsWith('tel:') || 
      ref.startsWith('#') ||
      ref.startsWith('sms:') ||
      ref.trim() === ''
    ) {
      return;
    }

    // Resolve reference
    const htmlDir = path.dirname(htmlFile);
    let resolvedPath;

    // Special allowance for the shared staging button relative script
    if (ref.includes('scripts/shared/comparison-button.js')) {
      resolvedPath = path.resolve(htmlDir, ref);
    } else {
      resolvedPath = path.join(htmlDir, ref);
    }

    // Extract query string or hashes if present
    const cleanPath = resolvedPath.split('?')[0].split('#')[0];

    if (!fs.existsSync(cleanPath)) {
      errors.push(`Broken local reference: '${ref}' in '${filename}' (resolved path: ${cleanPath})`);
      hasErrors = true;
    }
  };

  for (const match of srcMatches) {
    checkRef(match[1]);
  }
  for (const match of hrefMatches) {
    checkRef(match[1]);
  }
});

// Final output
console.log('--- Summary ---');
if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.forEach(warn => console.log(`  [WARN] ${warn}`));
}
if (hasErrors) {
  console.error(`\nErrors (${errors.length}):`);
  errors.forEach(err => console.error(`  [ERROR] ${err}`));
  console.log('\n❌ Validation FAILED.');
  process.exit(1);
} else {
  console.log('\n✓ Validation PASSED. Ready for polish checks.');
  process.exit(0);
}
