const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const scriptsSource = path.join(repoRoot, 'scripts');

let testRoot, testScriptsDir;

function runValidate(args) {
  const cmd = `node "${path.join(testScriptsDir, 'validate-restaurant.js')}" ${args}`;
  try {
    const stdout = execSync(cmd, {
      cwd: testRoot,
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { exitCode: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      exitCode: err.status ?? 1,
      stdout: err.stdout || '',
      stderr: err.stderr || ''
    };
  }
}

function createRestaurant(slug, files) {
  const dir = path.join(testRoot, 'restaurants', slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    const filePath = path.join(dir, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function baseMetadata(slug, overrides) {
  const meta = {
    id: slug,
    name: 'Test Restaurant',
    slug: slug,
    location: { city: 'Test', state: 'TS', address: '123 Test St' },
    stage: 'staging',
    status: 'ready-for-polish',
    sourceRepository: 'dev-in-portfolio/restaurants',
    sourcePath: 'restaurants/' + slug,
    currentWebsiteUrl: 'https://example.com',
    currentPublicPresenceType: 'website',
    demoRoute: 'restaurants/' + slug + '/index.html',
    informationVerifiedAt: null,
    promotedToStagingAt: new Date().toISOString(),
    promotedToShowcaseAt: null,
    desktopReviewed: false,
    tabletReviewed: false,
    mobileReviewed: false,
    linksVerified: false,
    contentVerified: false,
    performanceReviewed: false,
    accessibilityReviewed: false,
    comparisonButtonAdded: false,
    comparisonButtonNotApplicable: false,
    productionBuildPassed: false,
    approvedForPresentation: false,
    notes: []
  };
  return { ...meta, ...overrides };
}

describe('Validate Restaurant', () => {
  before(() => {
    testRoot = fs.mkdtempSync(path.join(repoRoot, 'tmp-test-validate-'));
    testScriptsDir = path.join(testRoot, 'scripts');

    fs.mkdirSync(testScriptsDir, { recursive: true });
    fs.mkdirSync(path.join(testRoot, 'restaurants'), { recursive: true });

    const scriptContent = fs.readFileSync(path.join(scriptsSource, 'validate-restaurant.js'), 'utf8');
    fs.writeFileSync(path.join(testScriptsDir, 'validate-restaurant.js'), scriptContent, 'utf8');
  });

  after(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  it('shows help output with --help flag', () => {
    const result = runValidate('--help');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('Usage:'));
    assert.ok(result.stdout.includes('--restaurant'));
  });

  it('exits nonzero when --restaurant is missing', () => {
    const result = runValidate('');
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stdout.includes('--restaurant'));
  });

  it('exits nonzero when restaurant directory does not exist', () => {
    const result = runValidate('--restaurant nonexistent-place');
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('Error') || result.stderr.includes('exist'));
  });

  it('passes for a valid restaurant with all required fields', () => {
    const slug = 'valid-restaurant';
    createRestaurant(slug, {
      'restaurant.json': JSON.stringify(baseMetadata(slug), null, 2),
      'index.html': '<html><body><h1>Home</h1><a href="menu.html">Menu</a><img src="style.css"></body></html>',
      'menu.html': '<html><body><h1>Menu</h1><a href="index.html">Home</a><link rel="stylesheet" href="style.css"></body></html>',
      'about.html': '<html><body><h1>About</h1><link rel="stylesheet" href="style.css"></body></html>',
      'contact.html': '<html><body><h1>Contact</h1><link rel="stylesheet" href="style.css"></body></html>',
      'order.html': '<html><body><h1>Order</h1><link rel="stylesheet" href="style.css"></body></html>',
      'events.html': '<html><body><h1>Events</h1><link rel="stylesheet" href="style.css"></body></html>',
      'style.css': 'body { color: red; }'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('PASSED'));
  });

  it('fails when restaurant.json is missing', () => {
    const slug = 'missing-metadata';
    createRestaurant(slug, {
      'index.html': '<html><body><h1>Home</h1></body></html>'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('restaurant.json') || result.stdout.includes('restaurant.json'));
  });

  it('fails for invalid restaurant.json format', () => {
    const slug = 'invalid-json';
    createRestaurant(slug, {
      'restaurant.json': 'not valid json {{{',
      'index.html': '<html><body><h1>Home</h1></body></html>'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('Invalid JSON') || result.stderr.includes('Error') || result.stdout.includes('Invalid'));
  });

  it('fails for invalid currentPublicPresenceType', () => {
    const slug = 'invalid-presence';
    createRestaurant(slug, {
      'restaurant.json': JSON.stringify(baseMetadata(slug, { currentPublicPresenceType: 'invalid-type' }), null, 2),
      'index.html': '<html><body><h1>Home</h1></body></html>'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('currentPublicPresenceType') || result.stdout.includes('currentPublicPresenceType'));
  });

  it('fails when index.html is missing', () => {
    const slug = 'no-index';
    createRestaurant(slug, {
      'restaurant.json': JSON.stringify(baseMetadata(slug), null, 2),
      'menu.html': '<html><body><h1>Menu</h1></body></html>',
      'about.html': '<html><body><h1>About</h1></body></html>'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('index.html') || result.stdout.includes('index.html') || result.stdout.includes('Missing'));
  });

  it('fails when no HTML files exist', () => {
    const slug = 'no-html';
    createRestaurant(slug, {
      'restaurant.json': JSON.stringify(baseMetadata(slug), null, 2),
      'data.txt': 'no html here'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stdout.includes('HTML') || result.stderr.includes('HTML'));
  });

  it('reports broken local references', () => {
    const slug = 'broken-refs';
    createRestaurant(slug, {
      'restaurant.json': JSON.stringify(baseMetadata(slug), null, 2),
      'index.html': '<html><body><img src="missing-image.jpg"><script src="missing.js"></script></body></html>'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.notEqual(result.exitCode, 0);
    const output = result.stdout + result.stderr;
    assert.ok(output.includes('missing-image.jpg') || output.includes('Broken local reference'));
  });

  it('passes with external URLs in links', () => {
    const slug = 'external-links';
    createRestaurant(slug, {
      'restaurant.json': JSON.stringify(baseMetadata(slug), null, 2),
      'index.html': '<html><body><a href="https://example.com">External</a><a href="tel:+1234567890">Call</a><a href="mailto:test@test.com">Email</a><a href="#section">Anchor</a></body></html>'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.equal(result.exitCode, 0);
  });

  it('warns about missing review flags', () => {
    const slug = 'missing-flags';
    const meta = baseMetadata(slug);
    delete meta.desktopReviewed;
    createRestaurant(slug, {
      'restaurant.json': JSON.stringify(meta, null, 2),
      'index.html': '<html><body><h1>Home</h1></body></html>'
    });
    const result = runValidate('--restaurant ' + slug);
    assert.ok(result.stdout.includes('desktopReviewed') || result.stdout.includes('not a boolean'));
  });
});
