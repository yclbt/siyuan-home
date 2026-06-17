#!/usr/bin/env node

/**
 * make_dev_link.js
 *
 * Creates a symlink from {workspace}/data/plugins/siyuan-homepage-pro
 * to the dist/ directory so changes are auto-detected by SiYuan.
 *
 * Usage:
 *   node --no-warnings ./scripts/make_dev_link.js
 *
 * Or via npm:
 *   npm run make-link
 */

import { readFileSync, existsSync, unlinkSync, symlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';

const CONFIG_DIR = resolve(homedir(), '.config', 'siyuan');
const CONFIG_FILE = join(CONFIG_DIR, 'dev.conf.json');

// ── Helpers ────────────────────────────────────────────────

function readJson(path) {
  try {
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  const cwd = process.cwd();
  const projectRoot = resolve(cwd);
  const distDir = join(projectRoot, 'dist');

  if (!existsSync(distDir)) {
    console.error(`❌ dist/ directory not found at: ${distDir}`);
    console.error('   Please run "npm run build" first.');
    process.exit(1);
  }

  // Try to auto-detect workspace from SiYuan dev config
  let workspacePath = null;
  const devConf = readJson(CONFIG_FILE);
  if (devConf && devConf.workspace) {
    workspacePath = devConf.workspace;
    console.log(`📂 Detected workspace from ${CONFIG_FILE}: ${workspacePath}`);
  }

  if (!workspacePath) {
    const answer = await prompt(
      '📂 Enter your SiYuan workspace path: '
    );
    if (!answer) {
      console.error('❌ No path provided. Aborting.');
      process.exit(1);
    }
    workspacePath = answer;
  }

  const resolvedWorkspace = resolve(workspacePath);
  const targetDir = join(resolvedWorkspace, 'data', 'plugins', 'siyuan-homepage-pro');

  if (!existsSync(resolvedWorkspace)) {
    console.error(`❌ Workspace path does not exist: ${resolvedWorkspace}`);
    process.exit(1);
  }

  // Remove existing symlink or directory if present
  if (existsSync(targetDir)) {
    try {
      unlinkSync(targetDir);
      console.log(`🗑️  Removed existing symlink/directory at: ${targetDir}`);
    } catch (err) {
      console.error(`❌ Failed to remove existing target: ${targetDir}`);
      console.error(`   ${err.message}`);
      process.exit(1);
    }
  }

  // Create symlink
  try {
    symlinkSync(distDir, targetDir, 'junction');
    console.log(`✅ Symlink created successfully!`);
    console.log(`   Source: ${distDir}`);
    console.log(`   Target: ${targetDir}`);
    console.log('');
    console.log('   Run "npm run dev" to start the development server.');
    console.log('   SiYuan will auto-detect changes from dist/.');
  } catch (err) {
    console.error(`❌ Failed to create symlink: ${err.message}`);
    console.error('');
    console.error('   On Windows, ensure you are running as Administrator');
    console.error('   or enable Developer Mode (Settings > Privacy & Security > For Developers).');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`❌ Unexpected error: ${err.message}`);
  process.exit(1);
});
