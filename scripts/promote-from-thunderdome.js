// Thunderdome to Staging Promotion Script
// Usage: npm run promote:staging -- --restaurant <restaurant-slug> [--update] [--dry-run] [--source <path>]

const fs = require('fs');
const path = require('path');

// Helper to parse arguments
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

// Display help if requested or if missing restaurant identifier
if (args.help || !args.restaurant) {
  console.log(`
Thunderdome to Staging Promotion Script

Usage:
  npm run promote:staging -- --restaurant <restaurant-slug> [options]

Required:
  --restaurant <slug>     The folder name / slug of the restaurant in the Thunderdome.

Options:
  --update                Overwrite the restaurant folder in staging if it already exists.
  --dry-run               Validate the source and print changes without copying files.
  --source <path>         Path to the local Thunderdome repository (defaults to '../restaurants').
  --help                  Show this help message.
  `);
  process.exit(!args.restaurant && !args.help ? 1 : 0);
}

const slug = args.restaurant;
const updateMode = !!args.update;
const dryRun = !!args.dry-run;
const thunderdomeRoot = path.resolve(args.source || '../restaurants');
const sourceDir = path.join(thunderdomeRoot, slug);
const stagingRoot = path.resolve(__dirname, '..');
const destDir = path.join(stagingRoot, 'restaurants', slug);

console.log(`Starting promotion for: ${slug}`);
console.log(`Source directory:   ${sourceDir}`);
console.log(`Destination dir:    ${destDir}`);
if (dryRun) console.log('*** DRY RUN MODE - No files will be written ***');

// 1. Confirm source exists
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source restaurant directory does not exist at '${sourceDir}'`);
  process.exit(1);
}

// 2. Detect destination conflicts
if (fs.existsSync(destDir) && !updateMode) {
  console.error(`Error: Restaurant '${slug}' already exists in staging.`);
  console.error(`Use --update flag to overwrite the existing files.`);
  process.exit(1);
}

// 3. Parse portal-overrides.js from the Thunderdome to auto-populate metadata
let parsedMetadata = {
  name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
  cuisine: "",
  area: ""
};

const overridesPath = path.join(thunderdomeRoot, 'portal-overrides.js');
if (fs.existsSync(overridesPath)) {
  try {
    const content = fs.readFileSync(overridesPath, 'utf8');
    const escapedSlug = slug.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const blockRegex = new RegExp(`\\{\\s*(?:[^{}]|\\{[^{}]*\\})*?href:\\s*["']${escapedSlug}/index.html["'](?:[^{}]|\\{[^{}]*\\})*?\\}`, 'gs');
    const match = content.match(blockRegex);
    if (match) {
      const block = match[0];
      const nameMatch = block.match(/name:\s*["'](.*?)["']/i);
      const cuisineMatch = block.match(/cuisine:\s*["'](.*?)["']/i);
      const areaMatch = block.match(/area:\s*["'](.*?)["']/i);
      if (nameMatch) parsedMetadata.name = nameMatch[1];
      if (cuisineMatch) parsedMetadata.cuisine = cuisineMatch[1];
      if (areaMatch) parsedMetadata.area = areaMatch[1];
      console.log(`Metadata parsed from portal-overrides.js:`);
      console.log(`  Name:    ${parsedMetadata.name}`);
      console.log(`  Cuisine: ${parsedMetadata.cuisine}`);
      console.log(`  Area:    ${parsedMetadata.area}`);
    }
  } catch (err) {
    console.warn(`Warning: Could not parse portal-overrides.js metadata (${err.message})`);
  }
}

// 4. File exclusion rules
const excludedNames = ['.git', '.github', '.migration', '.staging-do-not-use.txt', 'node_modules', '.DS_Store', 'Thumbs.db', 'qa'];
function shouldCopy(srcPath) {
  const relative = path.relative(sourceDir, srcPath);
  if (!relative) return true;
  const parts = relative.split(path.sep);
  return !parts.some(part => excludedNames.includes(part) || part.startsWith('.'));
}

// 5. Gather file statistics
const filesToCopy = [];
function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (!shouldCopy(fullPath)) continue;
    if (entry.isDirectory()) {
      collectFiles(fullPath);
    } else {
      filesToCopy.push(fullPath);
    }
  }
}
collectFiles(sourceDir);

// 6. Perform copy (if not dry run)
let copiedCount = 0;
let skippedCount = 0;
const copiedFilesList = [];

if (!dryRun) {
  fs.mkdirSync(destDir, { recursive: true });
  filesToCopy.forEach(file => {
    const relative = path.relative(sourceDir, file);
    const destFile = path.join(destDir, relative);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.copyFileSync(file, destFile);
    copiedFilesList.push(relative);
    copiedCount++;
  });
} else {
  filesToCopy.forEach(file => {
    const relative = path.relative(sourceDir, file);
    copiedFilesList.push(relative);
    copiedCount++;
  });
}

// 7. Generate or validate restaurant.json
const metadataPath = path.join(destDir, 'restaurant.json');
let existingMetadata = {};
if (fs.existsSync(metadataPath) && updateMode) {
  try {
    existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log(`Preserving existing review flags from restaurant.json...`);
  } catch (e) {
    console.warn(`Warning: Could not parse existing restaurant.json (${e.message})`);
  }
}

const metadata = {
  id: existingMetadata.id || slug,
  name: existingMetadata.name || parsedMetadata.name,
  slug: existingMetadata.slug || slug,
  location: {
    city: existingMetadata.location?.city || parsedMetadata.area || "Charlotte",
    state: existingMetadata.location?.state || "NC",
    address: existingMetadata.location?.address || ""
  },
  stage: "staging",
  status: existingMetadata.status || "ready-for-polish",
  sourceRepository: "dev-in-portfolio/restaurants",
  sourcePath: `restaurants/${slug}`,
  currentWebsiteUrl: existingMetadata.currentWebsiteUrl || "",
  currentPublicPresenceType: existingMetadata.currentPublicPresenceType || "website",
  demoRoute: `restaurants/${slug}/index.html`,
  informationVerifiedAt: existingMetadata.informationVerifiedAt || null,
  promotedToStagingAt: existingMetadata.promotedToStagingAt || new Date().toISOString(),
  promotedToShowcaseAt: existingMetadata.promotedToShowcaseAt || null,
  desktopReviewed: existingMetadata.desktopReviewed || false,
  mobileReviewed: existingMetadata.mobileReviewed || false,
  linksVerified: existingMetadata.linksVerified || false,
  contentVerified: existingMetadata.contentVerified || false,
  performanceReviewed: existingMetadata.performanceReviewed || false,
  accessibilityReviewed: existingMetadata.accessibilityReviewed || false,
  comparisonButtonAdded: existingMetadata.comparisonButtonAdded || false,
  productionBuildPassed: existingMetadata.productionBuildPassed || false,
  approvedForPresentation: existingMetadata.approvedForPresentation || false,
  notes: existingMetadata.notes || ["Initial promotion metadata generated automatically from Thunderdome override source."]
};

if (!dryRun) {
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`Successfully generated/updated metadata at '${metadataPath}'`);
} else {
  console.log(`[DRY RUN] Would generate metadata at '${metadataPath}' with structure:`);
  console.log(JSON.stringify(metadata, null, 2));
}

// 8. Run basic validation
console.log('\n--- Post-Copy Validation ---');
const validationErrors = [];
const htmlFiles = filesToCopy.filter(f => f.endsWith('.html'));

if (htmlFiles.length === 0) {
  validationErrors.push('No HTML files copied.');
}
if (!filesToCopy.some(f => path.basename(f) === 'index.html')) {
  validationErrors.push('Missing index.html (Home page).');
}

// Check for 6 separate substantive pages
if (htmlFiles.length < 6) {
  console.log(`Warning: Only ${htmlFiles.length} HTML pages found. The 6-page standard is not met.`);
} else {
  console.log(`Success: Found ${htmlFiles.length} HTML pages.`);
}

if (validationErrors.length > 0) {
  console.error('\nValidation Errors:');
  validationErrors.forEach(err => console.error(`  - ${err}`));
  if (!dryRun) {
    process.exit(1);
  }
} else {
  console.log('Static directory structure matches staging specifications.');
}

console.log(`\n--- Summary ---`);
console.log(`Copied/Processed: ${copiedCount} files`);
console.log(`Skipped:          ${skippedCount} files`);
console.log(`Staging status:   ready-for-polish`);
console.log('Promotion completed successfully.');
