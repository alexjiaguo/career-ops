import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve vault path from env var or config.
 * Priority: CAREER_OPS_VAULT_PATH env > obsidian-bridge.md default
 */
function resolveVaultPath() {
  if (process.env.CAREER_OPS_VAULT_PATH) return process.env.CAREER_OPS_VAULT_PATH;
  const home = process.env.HOME || process.env.USERPROFILE || '';
  return path.join(home, 'Library/Mobile Documents/iCloud~md~obsidian/Documents/Life_OS/10_Projects/02_Job_Hunt_2026');
}

const VAULT_PATH = resolveVaultPath();
const JD_POOL = path.join(VAULT_PATH, '10_JD_Pool');

// Known ATS mappings for major targets (Lever and Greenhouse)
const ATS_TARGETS = [
  // --- Original targets ---
  { name: 'Stripe', type: 'greenhouse', slug: 'stripe' },
  { name: 'Figma', type: 'greenhouse', slug: 'figma' },
  { name: 'Canva', type: 'lever', slug: 'canva' },
  { name: 'Discord', type: 'greenhouse', slug: 'discord' },
  { name: 'Airbnb', type: 'greenhouse', slug: 'airbnb' },
  { name: 'Pinterest', type: 'greenhouse', slug: 'pinterest' },
  { name: 'Reddit', type: 'greenhouse', slug: 'reddit' },
  { name: 'Riot Games', type: 'greenhouse', slug: 'riotgames' },
  { name: 'Epic Games', type: 'greenhouse', slug: 'epicgames' },
  { name: 'GitLab', type: 'greenhouse', slug: 'gitlab' },
  { name: 'Twitch', type: 'greenhouse', slug: 'twitch' },
  { name: 'The Trade Desk', type: 'greenhouse', slug: 'thetradedesk' },
  { name: 'Criteo', type: 'greenhouse', slug: 'criteo' },
  { name: 'Agoda', type: 'greenhouse', slug: 'agabordaresort' },
  { name: 'Notion', type: 'lever', slug: 'notion' },
  { name: 'Roblox', type: 'greenhouse', slug: 'roblox' },
  // --- APAC Expansion: Fintech/Payments ---
  { name: 'Airwallex', type: 'greenhouse', slug: 'airwallex' },
  { name: 'Wise', type: 'greenhouse', slug: 'transferwise' },
  { name: 'Adyen', type: 'greenhouse', slug: 'adyen' },
  { name: 'Circle', type: 'greenhouse', slug: 'circle' },
  { name: 'Revolut', type: 'lever', slug: 'revolut' },
  // --- APAC Expansion: Developer Tools / SaaS ---
  { name: 'Datadog', type: 'greenhouse', slug: 'datadog' },
  { name: 'Cloudflare', type: 'greenhouse', slug: 'cloudflare' },
  { name: 'Elastic', type: 'greenhouse', slug: 'elastic' },
  { name: 'MongoDB', type: 'greenhouse', slug: 'mongodb' },
  { name: 'Confluent', type: 'greenhouse', slug: 'confluent' },
  { name: 'HashiCorp', type: 'greenhouse', slug: 'hashicorp' },
  { name: 'Grafana Labs', type: 'greenhouse', slug: 'grafanalabs' },
  { name: 'Sentry', type: 'greenhouse', slug: 'sentry' },
  { name: 'PostHog', type: 'greenhouse', slug: 'posthog' },
  { name: 'Linear', type: 'greenhouse', slug: 'linear' },
  // --- APAC Expansion: Crypto/Web3 ---
  { name: 'Kraken', type: 'greenhouse', slug: 'kraken' },
  { name: 'Chainlink Labs', type: 'greenhouse', slug: 'chainlinklabs' },
  { name: 'Consensys', type: 'greenhouse', slug: 'consensys' },
  // --- APAC Expansion: Gaming ---
  { name: 'Ubisoft', type: 'greenhouse', slug: 'ubisoft' },
  { name: 'Electronic Arts', type: 'greenhouse', slug: 'electronicarts' },
  // --- APAC Expansion: Travel/Marketplace ---
  { name: 'Klook', type: 'greenhouse', slug: 'klook' },
  { name: 'PropertyGuru', type: 'greenhouse', slug: 'propertyguru' },
  // --- APAC Expansion: Enterprise ---
  { name: 'ServiceNow', type: 'greenhouse', slug: 'servicenow' },
  { name: 'Twilio', type: 'greenhouse', slug: 'twilio' },
];

const TARGET_LOCATIONS = ['singapore', 'beijing', 'shanghai', 'hong kong', 'shenzhen', 'hangzhou', 'guangzhou', 'chengdu', 'remote', 'apac', 'asia'];

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '')
             .replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/\n\s*\n/g, '\n\n')
             .trim();
}

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(`Failed to fetch ${url}: ${res.statusCode}`);
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(rawData)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
};

async function processGreenhouse(company) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`;
  console.log(`[${company.name}] Scanning Greenhouse API...`);
  try {
    const data = await fetchUrl(url);
    if (!data.jobs) return;
    
    for (const job of data.jobs) {
      const title = job.title.toLowerCase();
      const loc = job.location.name.toLowerCase();
      
      // Filter: Must be a Product Manager role in Target Locations
      if ((title.includes('product manager') || title.includes('product leader')) && !title.includes('engineering')) {
        const matchLoc = TARGET_LOCATIONS.some(tl => loc.includes(tl));
        if (matchLoc || loc.includes('china') || loc.includes('apac')) {
          saveToVault(company.name, job.title, job.location.name, job.absolute_url, job.id, stripHtml(job.content));
        }
      }
    }
  } catch (err) {
    console.error(`[${company.name}] API Error: ${err}`);
  }
}

async function processLever(company) {
  const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
  console.log(`[${company.name}] Scanning Lever API...`);
  try {
    const data = await fetchUrl(url);
    for (const job of data) {
      const title = job.text.toLowerCase();
      const loc = job.categories?.location?.toLowerCase() || '';
      const content = job.description || job.descriptionPlain || '';
      
      if ((title.includes('product manager') || title.includes('product leader'))) {
        const matchLoc = TARGET_LOCATIONS.some(tl => loc.includes(tl));
        if (matchLoc || loc.includes('china') || loc.includes('apac')) {
          saveToVault(company.name, job.text, job.categories.location, job.hostedUrl, job.id, stripHtml(content));
        }
      }
    }
  } catch (err) {
    console.error(`[${company.name}] API Error: ${err}`);
  }
}

function saveToVault(company, title, location, url, id, content) {
  const safeTitle = title.replace(/\//g, '-').replace(/:/g, '');
  const fileName = `${safeTitle} | ${company} | ATS.md`;
  const filePath = path.join(JD_POOL, fileName);

  const markdown = `---
title: "${safeTitle} | ${company} | ATS"
source: "${url}"
created: ${new Date().toISOString().split('T')[0]}
tags:
  - jobs
  - ats-scanned
status: new
Tier: ""
score: ""
company: "${company}"
location: "${location}"
remote: "${location.toLowerCase().includes('remote') ? 'remote' : 'hybrid'}"
archetype: ""
pdf_generated: false
description: "Automatically extracted via ATS API proxy."
_ats_id: "${id}"
---

## ${title}

**Location:** ${location}
**Company:** ${company}
**ATS JD ID:** \`${id}\`

### Job Description
${content}
`;

  fs.writeFileSync(filePath, markdown);
  console.log(`  -> Saved: ${fileName}`);
}

async function main() {
  console.log(`Starting ATS Scanner... Mapping ${ATS_TARGETS.length} Companies`);
  for (const company of ATS_TARGETS) {
    if (company.type === 'greenhouse') {
      await processGreenhouse(company);
    } else if (company.type === 'lever') {
      await processLever(company);
    }
  }
  console.log('ATS Scanning Complete.');
}

main();
