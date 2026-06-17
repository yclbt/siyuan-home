#!/usr/bin/env node

/**
 * make_install.js
 *
 * Creates a bazaar-ready package.zip in the dist/ directory.
 * Expected to be run after `npm run build` (dist/ must already exist).
 *
 * Usage:
 *   node --no-warnings ./scripts/make_install.js
 *
 * Or via npm:
 *   npm run make-install
 */

import { readFileSync, existsSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';

const cwd = process.cwd();
const projectRoot = resolve(cwd);
const distDir = join(projectRoot, 'dist');

// ── Helpers ────────────────────────────────────────────────

function readJson(path) {
  try {
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function safeCopy(src, dest) {
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true, force: true });
    return true;
  }
  return false;
}

// ── Main ───────────────────────────────────────────────────

/** Find the CSS file in dist/ (name varies by package.json name) */
function findCssFile(distDir) {
  const files = readdirSync(distDir);
  const css = files.find(f => f.endsWith('.css') && !f.includes('.map'));
  if (!css) {
    // Common fallback names
    for (const name of ['style.css', 'siyuan-home.css', 'index.css']) {
      if (existsSync(join(distDir, name))) return join(distDir, name);
    }
    console.error('❌ Could not find CSS file in dist/');
    process.exit(1);
  }
  return join(distDir, css);
}

function main() {
  // 1. Read plugin.json
  const pluginJsonPath = join(projectRoot, 'plugin.json');
  if (!existsSync(pluginJsonPath)) {
    console.error('❌ plugin.json not found at project root.');
    process.exit(1);
  }
  const plugin = readJson(pluginJsonPath);
  if (!plugin || !plugin.name) {
    console.error('❌ plugin.json is invalid or missing "name" field.');
    process.exit(1);
  }
  const pluginName = plugin.name;
  console.log(`📦 Plugin: ${pluginName}`);

  // 2. Verify dist/ exists (build should have run before this script)
  if (!existsSync(distDir)) {
    console.error(`❌ dist/ directory not found at: ${distDir}`);
    console.error('   Please run "npm run build" first.');
    process.exit(1);
  }

  // 3. Create a temporary staging directory
  const tmpId = randomBytes(8).toString('hex');
  const stagingDir = join(tmpdir(), `pkg-${pluginName}-${tmpId}`);
  ensureDir(stagingDir);
  console.log(`📁 Staging directory: ${stagingDir}`);

  // 4. Copy required files into the staging directory
  const cssFile = findCssFile(distDir);
  const copies = [
    // From project root
    { src: pluginJsonPath, dest: join(stagingDir, 'plugin.json') },
    { src: join(projectRoot, 'icon.png'), dest: join(stagingDir, 'icon.png') },
    { src: join(projectRoot, 'preview.png'), dest: join(stagingDir, 'preview.png'), optional: true },
    { src: join(projectRoot, 'README.md'), dest: join(stagingDir, 'README.md') },
    { src: join(projectRoot, 'README_zh_CN.md'), dest: join(stagingDir, 'README_zh_CN.md'), optional: true },
    // From dist/
    { src: join(distDir, 'index.js'), dest: join(stagingDir, 'index.js') },
    { src: cssFile, dest: join(stagingDir, 'index.css') },
    // i18n/ directory if it exists at project root
    { src: join(projectRoot, 'i18n'), dest: join(stagingDir, 'i18n'), optional: true, recursive: true },
  ];

  let copiedCount = 0;
  let skippedCount = 0;

  for (const entry of copies) {
    if (existsSync(entry.src)) {
      if (entry.recursive) {
        ensureDir(entry.dest);
        cpSync(entry.src, entry.dest, { recursive: true, force: true });
      } else {
        cpSync(entry.src, entry.dest, { force: true });
      }
      console.log(`   ✅ Copied: ${basename(entry.src)}`);
      copiedCount++;
    } else if (entry.optional) {
      console.log(`   ⏭️  Skipped (optional): ${basename(entry.src)}`);
      skippedCount++;
    } else {
      console.error(`   ❌ Missing required file: ${entry.src}`);
      process.exit(1);
    }
  }

  // 5. Create package.zip in dist/ using the 'zip' CLI command
  const outputZip = join(distDir, 'package.zip');

  // Remove existing package.zip if present
  if (existsSync(outputZip)) {
    rmSync(outputZip, { force: true });
  }

  try {
    execSync(
      `cd "${stagingDir}" && zip -r "${outputZip}" .`,
      { stdio: 'inherit', cwd: stagingDir }
    );
  } catch (err) {
    console.error('❌ Failed to create package.zip using zip CLI.');
    console.error(`   ${err.message}`);
    process.exit(1);
  }

  // 6. Clean up staging directory
  rmSync(stagingDir, { recursive: true, force: true });
  console.log(`🧹 Cleaned up staging directory`);

  // 7. Print result
  console.log('');
  console.log(`✅ package.zip created successfully!`);
  console.log(`   Path: ${outputZip}`);
  console.log(`   Files: ${copiedCount} copied, ${skippedCount} optional skipped`);
}

main();
