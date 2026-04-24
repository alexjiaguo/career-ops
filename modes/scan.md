# Mode: scan — Portal Scanner (Obsidian-Native)

Scan job boards and company career pages for AI Product Manager roles matching the user's target profile. Output discovered JDs as individual markdown files in the Obsidian vault's `10_JD_Pool/` folder.

## Prerequisites

1. Read `modes/obsidian-bridge.md` for vault paths and frontmatter conventions
2. Read `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml` for targeting config
3. Read `{vault}/99_The_Treasure_Vault/01_Career_Ops/target-companies.yml` for company list
4. If `target-companies.yml` is empty, run `discover-companies` mode first

## Scanning Strategy (Hybrid — Best Results)

Use a 3-level approach for maximum coverage:

### Level 1 — Playwright Direct (PRIMARY, most reliable)

For each company in `target-companies.yml` with `enabled: true` and `careers_url`:

1. `browser_navigate` to the `careers_url`
2. `browser_snapshot` to read all job listings
3. If the page has department filters, navigate to relevant sections (Product, AI, etc.)
4. For each job listing: extract `{title, url, company, location}`
5. If the page paginates, navigate additional pages
6. Accumulate all candidates

**NEVER run 2+ Playwright agents in parallel.** Sequential only.

### Level 2a — JobSpy (PRIMARY for international board discovery)

Use the `jobspy-scan.py` script to scrape LinkedIn, Indeed, Glassdoor, and Google Jobs in a single structured call. This replaces all previous `site:` web search queries for international boards.

**How to run:**

```bash
# Direct query (agent runs via run_command)
python3 jobspy-scan.py --search-term "AI product manager" --location "Singapore" --sites linkedin,indeed,google --results 50 --hours-old 168

# Config-driven (auto-generates queries from config.yml roles × locations)
python3 jobspy-scan.py --config {vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml
```

**Processing JobSpy output:**
1. Parse JSON array from stdout (each object has `title`, `company`, `job_url`, `location`, `is_remote`, `description`, `site`, etc.)
2. Apply `title_filter` from `config.yml` (same rules as before)
3. Deduplicate against existing JD files and scan-history.tsv
4. For jobs with descriptions (especially from `--linkedin-fetch-description`), proceed directly to JD file creation
5. For jobs without full descriptions, queue for Level 3 Playwright verification

**Run order — generate queries from config targeting:**
1. For each role in `config.yml → targeting.roles`
2. For each city in `config.yml → targeting.locations[].cities`
3. Run `jobspy-scan.py` with that role × city combination
4. Or use `--config` flag to do all at once

**Rate limiting notes:**
- Indeed: no rate limiting, best source
- LinkedIn: rate-limits around page 10 without proxies. For moderate volume (50-100 results) this is usually fine
- Google Jobs: requires specific query syntax; the script auto-generates `google_search_term`
- Add 2-3 second delays between separate `jobspy-scan.py` invocations

**Covers:** LinkedIn, Indeed, Glassdoor, Google Jobs, ZipRecruiter — all international boards from `config.yml → job_boards.international`, plus Hong Kong (JobsDB indexed via Google Jobs) and Singapore (JobStreet, MyCareersFuture indexed via Google Jobs).

### Level 2a+ — linkedin-scan.mjs (LINKEDIN-SPECIFIC supplement)

A lightweight Node.js-native LinkedIn scraper (`linkedin-jobs-api` npm package). No API key, no Python needed. Use when you want fast LinkedIn-only queries — especially useful for:
- Quick single-role lookups
- Paginated queries (supports `--page` for deeper results)
- Experience-level filtering (`--experience senior`)

```bash
# Basic scan
node linkedin-scan.mjs --keyword "AI product manager" --location "Singapore" --limit 25

# With filters
node linkedin-scan.mjs --keyword "Head of Product AI" --location "Hong Kong" --limit 25 --experience senior --date "past week"

# Paginate for more results
node linkedin-scan.mjs --keyword "AI product manager" --location "Singapore" --limit 25 --page 0
node linkedin-scan.mjs --keyword "AI product manager" --location "Singapore" --limit 25 --page 1
```

**Output:** Same JSON schema as `jobspy-scan.py` — process identically (title filter → dedup → JD creation or Level 3 verification).

> [!TIP]
> When to use which: **JobSpy** for multi-board sweeps (LinkedIn + Indeed + Google in one call). **linkedin-scan.mjs** for LinkedIn-only with pagination/experience filters.

### Level 2b — Chinese Boards (WEB SEARCH FALLBACK)

JobSpy does not cover Chinese job boards. Use web search `site:` queries as fallback:

```
"产品经理" AI site:liepin.com
"产品经理" AI site:zhipin.com
"产品经理" AI site:lagou.com
"AI product manager" China site:linkedin.com/jobs
```

**China job board access note:** If direct Playwright navigation to 猎聘/BOSS直聘/拉勾 fails (anti-scraping, CAPTCHA, login wall):
1. Fall back to `site:domain.com` web search queries to find indexed listings
2. Search for the company's own career pages instead
3. Flag the board as `access_limited` in the scan report and suggest manual check

#### Foreign Companies in China
For companies in `target-companies.yml` with China locations:
```
"{company}" careers "product manager" (Beijing OR Shanghai OR China)
```

### Level 3 — Playwright Verification (for Level 2 results)

Web search results may be stale. Before adding any Level 2 result to the JD pool, verify it with Playwright:

1. `browser_navigate` to the URL
2. `browser_snapshot` to read content
3. Classify:
   - **Active**: Job title visible + description + Apply button
   - **Expired**: "no longer available" / "position filled" / redirect to error / content < 300 chars
4. If expired: discard and log
5. If active: proceed to output

## Title Filtering

Apply `title_filter` from `config.yml`:
- At least 1 keyword from `positive` must appear in the title (case-insensitive)
- 0 keywords from `negative` may appear
- `seniority_boost` keywords prioritize but don't exclude

Support bilingual matching:
- English: "product manager", "head of product"
- Chinese: "产品经理", "产品总监", "产品负责人"

## Deduplication

Check against 3 sources:
1. **Existing JD files** in `{vault}/10_JD_Pool/` — match by company + normalized role title
2. **Scan history** in `{vault}/99_The_Treasure_Vault/01_Career_Ops/scan-history.tsv` — URL match
3. **Archived roles** in `{vault}/90_Archived_Roles/` — company + role already processed

## Output — JD Files to Obsidian

For each new, verified job listing that passes filters:

### 1. Extract Full JD Content

Navigate to the job listing URL with Playwright and extract the complete JD text.

### 2. Create JD File

Write to `{vault}/10_JD_Pool/{Role Title} | {Company} | {Source}.md`:

```markdown
---
title: "{Role Title} | {Company} | {Source}"
source: "{url}"
created: {YYYY-MM-DD}
tags:
  - jobs
  - {archetype-tag}
  - {location-tag}
status: new
Tier:
score:
company: "{Company}"
location: "{City, Country}"
remote: "{onsite|hybrid|remote}"
archetype:
pdf_generated: false
description: ""
---

## {Role Title}

{Full JD content extracted from the career page}
```

### 3. Log to Scan History

Append to `{vault}/99_The_Treasure_Vault/01_Career_Ops/scan-history.tsv`:
```
{url}\t{date}\t{source}\t{title}\t{company}\t{status}
```

Where `status` is one of: `added`, `skipped_title`, `skipped_dup`, `skipped_expired`

## Scan Summary

After completing all levels, display:

```
Portal Scan — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Boards scanned: N
Companies checked: N
Listings found: N total
Passed title filter: N
Duplicates skipped: N
Expired/dead links: N
New JDs added to 10_JD_Pool: N

  + {Company} | {Role Title} | {Source}
  + {Company} | {Role Title} | {Source}
  ...

Boards with limited access:
  ⚠ BOSS直聘 — login wall, used web search fallback
  ...

→ Run evaluation on new JDs to score and tier them.
```

## Rules

- **NEVER create duplicate JD files.** Always check existing files first.
- **NEVER fabricate JD content.** Only write what was actually extracted from the source.
- **Sequential Playwright only.** Never run parallel browser sessions.
- **Respect rate limits.** Add 2-3 second delays between Playwright navigations.
- **Log everything.** Every URL seen goes into scan-history.tsv with a status.
- **English output.** Even for Chinese JDs, the frontmatter and tags should be in English. The JD body content can remain in its original language.
