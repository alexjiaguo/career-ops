# Mode: discover-companies — Dynamic Company List Generator

Generate a targeted list of companies likely to have open AI Product Manager roles in the user's target locations. This replaces the static `portals.yml` approach.

## When to Run

- At the start of a new job search campaign
- When the user says "find new companies" or "refresh company list"
- Periodically (every 2 weeks) to discover new entrants

## Inputs

1. **Config**: Read `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml`
2. **CV**: Read `cv.md` in project root — extract industry domains, company types, tech stack
3. **Existing JD Pool**: Read files in `{vault}/10_JD_Pool/` — learn which companies have been seen

## Discovery Strategy

### Phase 1 — Profile-Based Seeding

Extract from the user's CV and config:
- **Industry domains**: ad-tech, AI/ML, SaaS, fintech, e-commerce, etc.
- **Company archetypes**: super-apps, AI labs, enterprise SaaS, marketplace, etc.
- **Tech-adjacent signals**: companies using similar stacks, building similar products

### Phase 2 — Location-Filtered Web Search

Run these search queries (adapt `{role}` and `{location}` from config):

#### International / LinkedIn
```
"AI Product Manager" OR "Senior Product Manager AI" (Beijing OR Shanghai OR "Hong Kong" OR Singapore OR remote) site:linkedin.com/jobs
```

#### Hong Kong
```
"product manager" AI (site:hk.jobsdb.com OR site:ctgoodjobs.hk)
"product manager" AI Hong Kong site:linkedin.com/jobs
```

#### Singapore
```
"product manager" AI (site:mycareersfuture.gov.sg OR site:jobstreet.com.sg)
"product manager" AI Singapore site:linkedin.com/jobs
```

#### Mainland China — Foreign Companies
```
"{company}" careers China "product manager" AI
```
For top 50 multinational tech companies: Google, Microsoft, Amazon, Apple, Meta, ByteDance, Alibaba, Tencent, Baidu, Grab, Agora, etc.

#### Mainland China — Job Boards
```
"产品经理" AI (site:liepin.com OR site:zhipin.com OR site:lagou.com)
```

**Note on China job boards:** BOSS直聘, 拉勾, and 猎聘 may have anti-scraping protections. If direct access fails:
1. **Fallback to web search**: Use `site:zhipin.com` in Google Search to find indexed listings
2. **Fallback to company career pages**: For known foreign companies with China offices, navigate directly to their career pages
3. **Flag for manual check**: Note which boards couldn't be accessed and suggest the user check manually

### Phase 2b — JobSpy Board Discovery

Run broad JobSpy searches to discover companies not yet in `target-companies.yml`:

```bash
python3 jobspy-scan.py --search-term "AI product manager" --location "Singapore" --sites linkedin,indeed,google --results 50
python3 jobspy-scan.py --search-term "AI product manager" --location "Hong Kong" --sites linkedin,indeed,google --results 50
python3 jobspy-scan.py --search-term "AI product manager" --location "Beijing" --sites linkedin,indeed,google --results 50
```

**Process results:**
1. Parse JSON output — each result has `company`, `company_url`, `job_url`
2. Extract unique company names not already in `target-companies.yml`
3. Auto-populate `careers_url` from `company_url` where available
4. Determine `ats_platform` from URL patterns (greenhouse.io, lever.co, workday.com, etc.)
5. Add new companies to `target-companies.yml` with `last_scanned: null` and `enabled: true`

> [!TIP]
> This is the most reliable way to discover companies actively hiring in your target roles — it comes from real, current job postings rather than generic web search results.

### Phase 3 — Company Expansion

For each company discovered:
1. Find their **careers page URL** (Greenhouse, Ashby, Lever, Workday, or custom)
2. Determine their **ATS platform** (helps with scanning strategy)
3. Note their **relevance** to the user's background

### Phase 4 — Deduplication

Compare against:
- Existing files in `{vault}/10_JD_Pool/` (company names already seen)
- Previous `target-companies.yml` entries

## Output

Write to `{vault}/99_The_Treasure_Vault/01_Career_Ops/target-companies.yml`:

```yaml
# Auto-generated: {YYYY-MM-DD}
# Source: discover-companies mode
# Total: N companies

companies:
  # ─── Tier 1: Strong relevance to profile ─────
  - name: "Grab"
    careers_url: "https://grab.careers/..."
    ats_platform: "custom"
    locations: ["Beijing", "Singapore"]
    relevance: "Ad-tech marketplace, direct JD match"
    last_scanned: null
    enabled: true

  - name: "ByteDance"
    careers_url: "https://jobs.bytedance.com/..."
    ats_platform: "custom"
    locations: ["Beijing", "Shanghai", "Singapore"]
    relevance: "AI-native, ad platform"
    last_scanned: null
    enabled: true

  # ─── Tier 2: Good relevance ──────────────────
  - name: "Agora"
    careers_url: "https://..."
    ats_platform: "greenhouse"
    locations: ["Shanghai"]
    relevance: "AI communications platform"
    last_scanned: null
    enabled: true

  # ─── Tier 3: Worth monitoring ────────────────
  # ...
```

## Post-Discovery

After generating the company list:
1. Display a summary: N companies found, broken down by tier and region
2. Ask the user if they want to add/remove any companies
3. Suggest running `scan` mode to find open positions at these companies

## Rules

- **NEVER fabricate company names or URLs.** Only include companies confirmed via web search.
- **Cite sources** for each company discovered (which search query found them).
- **Prioritize quality over quantity.** 30 well-matched companies > 100 random ones.
- **Update, don't replace.** When re-running, merge new discoveries into existing list rather than overwriting user edits.
