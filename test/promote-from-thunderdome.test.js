const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const scriptsSource = path.join(repoRoot, 'scripts');

let testRoot, testStagingDir, testScriptsDir, testThunderdomeDir;

function runPromote(args) {
  const cmd = `node "${path.join(testScriptsDir, 'promote-from-thunderdome.js')}" ${args}`;
  try {
    const stdout = execSync(cmd, {
      cwd: testStagingDir,
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

function createThunderdomeRestaurant(slug, files) {
  const dir = path.join(testThunderdomeDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    const filePath = path.join(dir, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

describe('Promote from Thunderdome', () => {
  before(() => {
    testRoot = fs.mkdtempSync(path.join(repoRoot, 'tmp-test-promote-'));
    testStagingDir = testRoot;
    testScriptsDir = path.join(testRoot, 'scripts');
    testThunderdomeDir = path.join(testRoot, 'thunderdome');

    fs.mkdirSync(testScriptsDir, { recursive: true });
    fs.mkdirSync(testThunderdomeDir, { recursive: true });
    fs.mkdirSync(path.join(testStagingDir, 'restaurants'), { recursive: true });

    const scriptContent = fs.readFileSync(path.join(scriptsSource, 'promote-from-thunderdome.js'), 'utf8');
    fs.writeFileSync(path.join(testScriptsDir, 'promote-from-thunderdome.js'), scriptContent, 'utf8');
  });

  after(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  it('shows help output with --help flag', () => {
    const result = runPromote('--help');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('Usage:'));
    assert.ok(result.stdout.includes('--restaurant'));
  });

  it('exits nonzero when --restaurant is missing', () => {
    const result = runPromote('');
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stdout.includes('--restaurant'));
  });

  it('exits nonzero when source folder does not exist', () => {
    const result = runPromote('--restaurant nonexistent-slug --source "' + testThunderdomeDir + '"');
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('Error') || result.stderr.includes('exist'));
  });

  it('dry run succeeds and creates no destination', () => {
    const slug = 'test-dry-run-restaurant';
    createThunderdomeRestaurant(slug, {
      'index.html': '<html><body><h1>Test</h1></body></html>',
      'menu.html': '<html><body><h1>Menu</h1></body></html>',
      'about.html': '<html><body><h1>About</h1></body></html>',
      'contact.html': '<html><body><h1>Contact</h1></body></html>',
      'order.html': '<html><body><h1>Order</h1></body></html>',
      'events.html': '<html><body><h1>Events</h1></body></html>'
    });

    const destDir = path.join(testStagingDir, 'restaurants', slug);
    assert.equal(fs.existsSync(destDir), false);

    const result = runPromote(`--restaurant ${slug} --dry-run --source "${testThunderdomeDir}"`);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('DRY RUN'));
    assert.equal(fs.existsSync(destDir), false, 'dry run should not create destination');
  });

  it('refuses to overwrite existing destination without --update flag', () => {
    const slug = 'test-overwrite-restaurant';
    createThunderdomeRestaurant(slug, {
      'index.html': '<html><body><h1>Test</h1></body></html>'
    });

    const destDir = path.join(testStagingDir, 'restaurants', slug);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(path.join(destDir, 'test.txt'), 'existing', 'utf8');

    const result = runPromote(`--restaurant ${slug} --source "${testThunderdomeDir}"`);
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('already exists'));
  });

  it('overwrites existing destination when --update flag is provided', () => {
    const slug = 'test-update-restaurant';
    createThunderdomeRestaurant(slug, {
      'index.html': '<html><body><h1>Updated</h1></body></html>',
      'about.html': '<html><body><h1>About</h1></body></html>',
      'menu.html': '<html><body><h1>Menu</h1></body></html>',
      'contact.html': '<html><body><h1>Contact</h1></body></html>',
      'order.html': '<html><body><h1>Order</h1></body></html>',
      'events.html': '<html><body><h1>Events</h1></body></html>'
    });

    const destDir = path.join(testStagingDir, 'restaurants', slug);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(path.join(destDir, 'old.txt'), 'old content', 'utf8');

    const result = runPromote(`--restaurant ${slug} --update --source "${testThunderdomeDir}"`);
    assert.equal(result.exitCode, 0);
    assert.ok(fs.existsSync(path.join(destDir, 'index.html')));
  });

  it('generates restaurant.json metadata with correct structure in dry run', () => {
    const slug = 'test-metadata-restaurant';
    createThunderdomeRestaurant(slug, {
      'index.html': '<html><body><h1>Test</h1></body></html>',
      'menu.html': '<html><body><h1>Menu</h1></body></html>',
      'about.html': '<html><body><h1>About</h1></body></html>',
      'contact.html': '<html><body><h1>Contact</h1></body></html>',
      'order.html': '<html><body><h1>Order</h1></body></html>',
      'events.html': '<html><body><h1>Events</h1></body></html>'
    });

    const result = runPromote(`--restaurant ${slug} --source "${testThunderdomeDir}" --dry-run`);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('"id":'));
    assert.ok(result.stdout.includes('"stage": "staging"'));
    assert.ok(result.stdout.includes('"status": "ready-for-polish"'));
    assert.ok(result.stdout.includes('"tabletReviewed"'));
    assert.ok(result.stdout.includes('"comparisonButtonNotApplicable"'));
  });

  it('preserves existing review flags during --update', () => {
    const slug = 'test-preserve-restaurant';
    createThunderdomeRestaurant(slug, {
      'index.html': '<html><body><h1>Test</h1></body></html>',
      'menu.html': '<html><body><h1>Menu</h1></body></html>',
      'about.html': '<html><body><h1>About</h1></body></html>',
      'contact.html': '<html><body><h1>Contact</h1></body></html>',
      'order.html': '<html><body><h1>Order</h1></body></html>',
      'events.html': '<html><body><h1>Events</h1></body></html>'
    });

    const destDir = path.join(testStagingDir, 'restaurants', slug);
    fs.mkdirSync(destDir, { recursive: true });
    const existingMeta = {
      id: slug,
      name: 'Preserved Restaurant',
      slug: slug,
      location: { city: 'Test', state: 'TS', address: '' },
      stage: 'staging',
      status: 'ready-for-polish',
      sourceRepository: 'dev-in-portfolio/restaurants',
      sourcePath: 'restaurants/' + slug,
      currentWebsiteUrl: '',
      currentPublicPresenceType: 'website',
      demoRoute: 'restaurants/' + slug + '/index.html',
      informationVerifiedAt: null,
      promotedToStagingAt: new Date().toISOString(),
      promotedToShowcaseAt: null,
      desktopReviewed: true,
      tabletReviewed: false,
      mobileReviewed: true,
      linksVerified: true,
      contentVerified: false,
      performanceReviewed: true,
      accessibilityReviewed: false,
      comparisonButtonAdded: true,
      comparisonButtonNotApplicable: false,
      productionBuildPassed: false,
      approvedForPresentation: false,
      notes: ['Existing note']
    };
    fs.writeFileSync(path.join(destDir, 'restaurant.json'), JSON.stringify(existingMeta, null, 2), 'utf8');

    const result = runPromote(`--restaurant ${slug} --update --source "${testThunderdomeDir}"`);
    assert.equal(result.exitCode, 0);
    const updatedMeta = JSON.parse(fs.readFileSync(path.join(destDir, 'restaurant.json'), 'utf8'));
    assert.equal(updatedMeta.desktopReviewed, true);
    assert.equal(updatedMeta.mobileReviewed, true);
    assert.equal(updatedMeta.linksVerified, true);
    assert.equal(updatedMeta.contentVerified, false);
    assert.equal(updatedMeta.notes.length, 1);
    assert.equal(updatedMeta.notes[0], 'Existing note');
  });

  it('copies rather than moves source files (source remains intact)', () => {
    const slug = 'test-copy-not-move-restaurant';
    createThunderdomeRestaurant(slug, {
      'index.html': '<html><body><h1>Test</h1></body></html>',
      'about.html': '<html><body><h1>About</h1></body></html>',
      'menu.html': '<html><body><h1>Menu</h1></body></html>',
      'contact.html': '<html><body><h1>Contact</h1></body></html>',
      'order.html': '<html><body><h1>Order</h1></body></html>',
      'events.html': '<html><body><h1>Events</h1></body></html>'
    });

    const sourcePath = path.join(testThunderdomeDir, slug, 'index.html');
    const destPath = path.join(testStagingDir, 'restaurants', slug);

    const result = runPromote(`--restaurant ${slug} --source "${testThunderdomeDir}"`);
    assert.equal(result.exitCode, 0);
    assert.ok(fs.existsSync(sourcePath), 'source file should still exist after copy');
    assert.ok(fs.existsSync(path.join(destPath, 'index.html')), 'destination file should exist');
  });

  it('fails and cleans up newly created incomplete destination when validation fails', () => {
    const slug = 'test-no-html-restaurant';
    createThunderdomeRestaurant(slug, {
      'data.txt': 'just a text file'
    });

    const destDir = path.join(testStagingDir, 'restaurants', slug);

    const result = runPromote(`--restaurant ${slug} --source "${testThunderdomeDir}"`);
    assert.notEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('No HTML files'));
    assert.equal(fs.existsSync(destDir), false, 'newly created incomplete destination should be cleaned up');
  });
});
