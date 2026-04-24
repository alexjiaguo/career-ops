#!/usr/bin/env node
/**
 * verify-pipeline.mjs — Health check for career-ops pipeline integrity
 *
 * Validates Obsidian vault JD files in 10_JD_Pool/:
 * 1. All frontmatter statuses are canonical (per obsidian-bridge.md lifecycle)
 * 2. No duplicate company+role JD files
 * 3. Required frontmatter fields are present
 * 4. Scores match format X.X/5 or are empty
 * 5. Tier assignment is consistent with score
 * 6. Source URLs are present for non-manual JDs
 *
 * Run: npm run verify
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));

// ── Simple .env loader ──────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w_-]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (match) process.env[match[1]] = match[2];
    }
  }
}

loadEnv();

// ── Vault path resolution ───────────────────────────────────────
function resolveVaultPath() {
  if (process.env.CAREER_OPS_VAULT_PATH) return process.env.CAREER_OPS_VAULT_PATH;
  return './vault'; // Generic default
}

const VAULT_BASE = resolveVaultPath();
const JD_POOL = join(VAULT_BASE, '10_JD_Pool');

// ── Canonical statuses (from obsidian-bridge.md) ────────────────
const CANONICAL_STATUSES = [
  'new', 'evaluated', 'applied', 'interviewing',
  'offered', 'rejected', 'discarded', 'archived',
];

// ── Required frontmatter fields ─────────────────────────────────
const REQUIRED_FIELDS = ['title', 'status', 'company'];
const RECOMMENDED_FIELDS = ['source', 'created', 'location', 'archetype'];

let errors = 0;
let warnings = 0;

function error(msg) { console.log(`❌ ${msg}`); errors++; }
function warn(msg) { console.log(`⚠️  ${msg}`); warnings++; }
function ok(msg) { console.log(`✅ ${msg}`); }

// ── Simple YAML frontmatter parser ──────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const yaml = match[1];
  const data = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^(\w[\w_-]*)\s*:\s*(.*)$/);
    if (m) {
      let val = m[2].trim();
      // Strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val === '' || val === '""' || val === "''") val = '';
      data[m[1]] = val;
    }
  }
  return data;
}

// ── Main ────────────────────────────────────────────────────────

if (!existsSync(JD_POOL)) {
  console.log('\n📂 JD Pool not found at:', JD_POOL);
  console.log('   Set CAREER_OPS_VAULT_PATH or check your Obsidian vault path.\n');
  process.exit(1);
}

let files;
try {
  files = readdirSync(JD_POOL).filter(f => f.endsWith('.md'));
} catch (err) {
  if (err.code === 'EPERM' || err.code === 'EACCES') {
    console.log('\n📂 JD Pool exists but is not accessible (iCloud sync permissions).');
    console.log('   Grant Terminal full disk access in System Settings > Privacy & Security,');
    console.log('   or set CAREER_OPS_VAULT_PATH to a local copy.\n');
    process.exit(0); // Not an error — just can't access from this context
  }
  throw err; // Re-throw unexpected errors
}

if (files.length === 0) {
  console.log('\n📊 No JD files found in 10_JD_Pool/. This is normal for a fresh setup.');
  console.log('   JD files will appear when you evaluate your first offer.\n');
  process.exit(0);
}

console.log(`\n📊 Checking ${files.length} JD files in 10_JD_Pool/\n`);

const entries = [];

for (const filename of files) {
  const filepath = join(JD_POOL, filename);
  const content = readFileSync(filepath, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm) {
    error(`${filename}: No YAML frontmatter found`);
    continue;
  }
  entries.push({ filename, fm });
}

// --- Check 1: Required frontmatter fields ---
let missingFields = 0;
for (const { filename, fm } of entries) {
  for (const field of REQUIRED_FIELDS) {
    if (!fm[field] && fm[field] !== false) {
      error(`${filename}: Missing required field '${field}'`);
      missingFields++;
    }
  }
  for (const field of RECOMMENDED_FIELDS) {
    if (!fm[field] && fm[field] !== false) {
      warn(`${filename}: Missing recommended field '${field}'`);
    }
  }
}
if (missingFields === 0) ok('All JD files have required frontmatter fields');

// --- Check 2: Canonical statuses ---
let badStatuses = 0;
for (const { filename, fm } of entries) {
  const status = (fm.status || '').toLowerCase().trim();
  if (!status) continue; // already caught by required fields check
  if (!CANONICAL_STATUSES.includes(status)) {
    error(`${filename}: Non-canonical status "${fm.status}" (valid: ${CANONICAL_STATUSES.join(', ')})`);
    badStatuses++;
  }
}
if (badStatuses === 0) ok('All statuses are canonical');

// --- Check 3: Duplicate company+role ---
const companyRoleMap = new Map();
let dupes = 0;
for (const { filename, fm } of entries) {
  const company = (fm.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const title = (fm.title || filename).toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const key = `${company}::${title}`;
  if (!companyRoleMap.has(key)) companyRoleMap.set(key, []);
  companyRoleMap.get(key).push(filename);
}
for (const [, group] of companyRoleMap) {
  if (group.length > 1) {
    warn(`Possible duplicates: ${group.join(', ')}`);
    dupes++;
  }
}
if (dupes === 0) ok('No duplicate JD files found');

// --- Check 4: Score format ---
let badScores = 0;
for (const { filename, fm } of entries) {
  const score = (fm.score || '').toString().trim();
  if (!score) continue; // Empty score is fine (not yet evaluated)
  if (!/^\d+\.?\d*\/5$/.test(score)) {
    error(`${filename}: Invalid score format "${score}" (expected X.X/5)`);
    badScores++;
  }
}
if (badScores === 0) ok('All scores valid');

// --- Check 5: Tier/score consistency ---
let tierMismatch = 0;
for (const { filename, fm } of entries) {
  const scoreStr = (fm.score || '').toString().trim();
  const tier = (fm.Tier || fm.tier || '').toString().trim();
  if (!scoreStr || !tier) continue;

  const scoreNum = parseFloat(scoreStr);
  if (isNaN(scoreNum)) continue;

  let expectedTier;
  if (scoreNum >= 4.0) expectedTier = 'Tier 1';
  else if (scoreNum >= 3.5) expectedTier = 'Tier 2';
  else expectedTier = 'Tier 3';

  if (tier !== expectedTier) {
    warn(`${filename}: Score ${scoreStr} → expected ${expectedTier}, got "${tier}"`);
    tierMismatch++;
  }
}
if (tierMismatch === 0) ok('Tier/score assignments consistent');

// --- Check 6: Source URLs ---
let missingSources = 0;
for (const { filename, fm } of entries) {
  const source = (fm.source || '').trim();
  if (!source || source === 'manual paste') continue;
  if (!source.startsWith('http')) {
    warn(`${filename}: Source "${source}" is not a valid URL`);
    missingSources++;
  }
}
if (missingSources === 0) ok('All source URLs valid');

// --- Summary ---
console.log('\n' + '='.repeat(50));
console.log(`📊 Pipeline Health: ${errors} errors, ${warnings} warnings (${entries.length} JD files)`);
if (errors === 0 && warnings === 0) {
  console.log('🟢 Pipeline is clean!');
} else if (errors === 0) {
  console.log('🟡 Pipeline OK with warnings');
} else {
  console.log('🔴 Pipeline has errors — fix before proceeding');
}

process.exit(errors > 0 ? 1 : 0);
