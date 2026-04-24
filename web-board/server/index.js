import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── Vault Path ──────────────────────────────────────────────────
// Priority: CAREER_OPS_VAULT_PATH env var > HOME-relative default.
// Falls back to sample data if the vault isn't accessible (e.g. iCloud not synced).
const VAULT_BASE = process.env.CAREER_OPS_VAULT_PATH || path.join(
  process.env.HOME || '',
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/Life_OS/10_Projects/02_Job_Hunt_2026'
);
const JD_POOL = path.join(VAULT_BASE, '10_JD_Pool');

// ── Sample Data (fallback when vault is inaccessible) ───────────
const SAMPLE_JDS = [
  {
    id: 'sample-grab-lead-pm-ai',
    frontmatter: {
      title: 'Lead Product Manager, AI Platform',
      company: 'Grab',
      location: 'Singapore',
      status: 'evaluated',
      tier: 1,
      score: 4.5,
      archetype: 'AI/ML Platform',
      url: 'https://grab.careers/jobs/',
      date_discovered: '2026-04-07',
    },
    body: '## About the Role\n\nGrab is seeking a Lead Product Manager to drive the AI Platform...\n\n### Responsibilities\n- Define product strategy for AI/ML platform\n- Partner with engineering to ship models\n- Drive adoption across business units\n\n### Requirements\n- 8+ years PM experience\n- Strong AI/ML background\n- Experience with recommendation systems',
  },
  {
    id: 'sample-amazon-sr-pm-global',
    frontmatter: {
      title: 'Senior Product Manager, Global Selling',
      company: 'Amazon',
      location: 'Shanghai',
      status: 'new',
      tier: 1,
      score: null,
      archetype: 'E-Commerce',
      url: 'https://amazon.jobs/',
      date_discovered: '2026-04-08',
    },
    body: '## About the Role\n\nAmazon Global Selling connects Chinese merchants with worldwide customers...\n\n### Responsibilities\n- Drive cross-border seller experience\n- Own GMV growth metrics\n- Coordinate with logistics teams\n\n### Requirements\n- 6+ years product management\n- E-commerce experience preferred\n- Fluent in Mandarin and English',
  },
  {
    id: 'sample-microsoft-sr-pm-copilot',
    frontmatter: {
      title: 'Senior Product Manager, Copilot for Mac',
      company: 'Microsoft',
      location: 'Beijing (STCA)',
      status: 'interviewing',
      tier: 1,
      score: 4.8,
      archetype: 'AI Productivity',
      url: 'https://careers.microsoft.com/',
      date_discovered: '2026-04-01',
    },
    body: '## About the Role\n\nJoin the Microsoft 365 Copilot team building AI-powered productivity...\n\n### Responsibilities\n- Define Copilot Mac experience strategy\n- Ship AI features with cross-platform parity\n- Drive user engagement and retention\n\n### Requirements\n- 7+ years PM experience\n- macOS platform knowledge\n- AI/LLM product experience',
  },
  {
    id: 'sample-apple-pm-employee-exp',
    frontmatter: {
      title: 'Senior Product Manager, Employee Experience',
      company: 'Apple',
      location: 'Hong Kong',
      status: 'new',
      tier: 2,
      score: null,
      archetype: 'Internal Tools',
      url: 'https://jobs.apple.com/',
      date_discovered: '2026-04-09',
    },
    body: '## About the Role\n\nApple\'s Information Systems & Technology team is looking for a PM...\n\n### Responsibilities\n- Modernize internal employee tools\n- Drive adoption of AI-powered workflows\n- Partner with Apple Intelligence team\n\n### Requirements\n- 5+ years PM experience\n- Enterprise SaaS background\n- Design-driven mindset',
  },
  {
    id: 'sample-shopee-pm-search',
    frontmatter: {
      title: 'Product Manager, Search & Recommendation',
      company: 'Shopee (Sea Group)',
      location: 'Singapore',
      status: 'evaluated',
      tier: 1,
      score: 4.2,
      archetype: 'Search / RecSys',
      url: 'https://careers.shopee.com/',
      date_discovered: '2026-04-06',
    },
    body: '## About the Role\n\nShopee\'s Search & Recommendation team powers product discovery...\n\n### Responsibilities\n- Own search relevance and ranking metrics\n- Drive CTR and conversion improvements\n- A/B test ML model iterations\n\n### Requirements\n- 5+ years PM in search/recommendation\n- Strong data analysis skills\n- E-commerce domain experience',
  },
  {
    id: 'sample-stripe-pm-payments',
    frontmatter: {
      title: 'Product Manager, Payment APIs',
      company: 'Stripe',
      location: 'Singapore / Remote',
      status: 'new',
      tier: 2,
      score: null,
      archetype: 'FinTech / Payments',
      url: 'https://stripe.com/jobs/',
      date_discovered: '2026-04-09',
    },
    body: '## About the Role\n\nStripe is expanding its APAC presence and looking for PMs to drive...\n\n### Responsibilities\n- Scale payment infrastructure for APAC\n- Design APIs for local payment methods\n- Drive developer adoption\n\n### Requirements\n- 6+ years PM experience\n- API/platform product experience\n- Payments or FinTech background',
  },
  {
    id: 'sample-agoda-pm-pricing',
    frontmatter: {
      title: 'Product Manager, ML Pricing Engine',
      company: 'Agoda',
      location: 'Singapore',
      status: 'applied',
      tier: 2,
      score: 3.8,
      archetype: 'ML / Pricing',
      url: 'https://careersatagoda.com/',
      date_discovered: '2026-04-03',
    },
    body: '## About the Role\n\nAgoda is hiring a PM to lead the ML-powered pricing engine...\n\n### Responsibilities\n- Optimize dynamic pricing algorithms\n- Drive revenue per available room\n- Partner with data science on model iteration\n\n### Requirements\n- 5+ years PM experience\n- Pricing or revenue management experience\n- Strong ML intuition',
  },
  {
    id: 'sample-tiktok-pm-ads',
    frontmatter: {
      title: 'Product Manager, Ad Serving Platform',
      company: 'TikTok',
      location: 'Singapore',
      status: 'evaluated',
      tier: 1,
      score: 4.6,
      archetype: 'Ad Tech',
      url: 'https://careers.tiktok.com/',
      date_discovered: '2026-04-05',
    },
    body: '## About the Role\n\nTikTok\'s monetization team is hiring PMs to scale the ad serving platform...\n\n### Responsibilities\n- Optimize ad ranking and relevance\n- Improve advertiser ROI metrics\n- Build real-time bidding features\n\n### Requirements\n- 6+ years PM experience\n- Ad-tech / CTR prediction background\n- Large-scale system experience',
  },
];

// ── Helpers ──────────────────────────────────────────────────────

function isVaultAccessible() {
  try {
    fs.accessSync(JD_POOL, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function readJDsFromVault() {
  const files = fs.readdirSync(JD_POOL).filter((f) => f.endsWith('.md'));
  return files.map((filename) => {
    const filepath = path.join(JD_POOL, filename);
    const raw = fs.readFileSync(filepath, 'utf-8');
    const { data: frontmatter, content: body } = matter(raw);
    return {
      id: filename.replace(/\.md$/, ''),
      frontmatter: {
        title: frontmatter.title || filename,
        company: frontmatter.company || 'Unknown',
        location: frontmatter.location || '',
        status: frontmatter.status || 'new',
        tier: frontmatter.tier || null,
        score: frontmatter.score || null,
        archetype: frontmatter.archetype || '',
        url: frontmatter.url || '',
        date_discovered: frontmatter.date_discovered || frontmatter.date || '',
        ...frontmatter,
      },
      body,
    };
  });
}

function getAllJDs() {
  if (isVaultAccessible()) {
    console.log(`  📂 Reading JDs from vault: ${JD_POOL}`);
    return readJDsFromVault();
  }
  console.log('  ⚠️  Vault not accessible — serving sample data');
  return SAMPLE_JDS;
}

// ── Routes ──────────────────────────────────────────────────────

app.get('/api/jds', (_req, res) => {
  try {
    const jds = getAllJDs();
    const summaries = jds.map(({ id, frontmatter }) => ({ id, ...frontmatter }));
    res.json({
      count: summaries.length,
      source: isVaultAccessible() ? 'vault' : 'sample',
      jds: summaries,
    });
  } catch (err) {
    console.error('Error reading JDs:', err);
    res.status(500).json({ error: 'Failed to read JDs', detail: err.message });
  }
});

app.get('/api/jds/:id', (req, res) => {
  try {
    const jds = getAllJDs();
    const jd = jds.find((j) => j.id === req.params.id);
    if (!jd) return res.status(404).json({ error: 'JD not found' });
    res.json(jd);
  } catch (err) {
    console.error('Error reading JD:', err);
    res.status(500).json({ error: 'Failed to read JD', detail: err.message });
  }
});

app.get('/api/stats', (_req, res) => {
  try {
    const jds = getAllJDs();
    const statuses = {};
    const tiers = {};
    let totalScore = 0;
    let scored = 0;

    jds.forEach(({ frontmatter }) => {
      const s = frontmatter.status || 'new';
      statuses[s] = (statuses[s] || 0) + 1;
      if (frontmatter.tier) {
        const t = `Tier ${frontmatter.tier}`;
        tiers[t] = (tiers[t] || 0) + 1;
      }
      if (frontmatter.score) {
        totalScore += frontmatter.score;
        scored++;
      }
    });

    res.json({
      total: jds.length,
      source: isVaultAccessible() ? 'vault' : 'sample',
      byStatus: statuses,
      byTier: tiers,
      avgScore: scored > 0 ? +(totalScore / scored).toFixed(1) : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// ── Start ───────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🚀 Career Ops API running at http://localhost:${PORT}`);
  console.log(`  📁 Vault path: ${JD_POOL}`);
  if (isVaultAccessible()) {
    const count = fs.readdirSync(JD_POOL).filter((f) => f.endsWith('.md')).length;
    console.log(`  ✅ Vault accessible — ${count} JDs found\n`);
  } else {
    console.log(`  ⚠️  Vault not accessible — using ${SAMPLE_JDS.length} sample JDs\n`);
  }
});
