# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Career-Ops — Obsidian-Native AI Job Search Pipeline

### Origin

This system is adapted from [alexjiaguo/career-ops](https://github.com/alexjiaguo/career-ops), customized for an Obsidian-native workflow with dynamic company discovery, APAC/China job board integration, and delegation to the user's own resume and interview prep skills.

## Commands

| Command | Purpose |
| ------- | ------- |
| `npm install` | Install dependencies (playwright) |
| `npx playwright install chromium` | Install browser for PDF generation and portal scanning |
| `npm run doctor` | Validate all prerequisites (Node >= 18, Playwright, cv.md, profile, fonts) |
| `npm run pdf` | Generate PDF from HTML: `node generate-pdf.mjs <input.html> <output.pdf> [--format=letter\|a4]` |
| `npm run verify` | Run pipeline integrity checks (validates JD files in Obsidian vault) |
| `npm run test` | Run full test suite (syntax, data contract, modes, paths) |
| `npm run liveness` | Check if tracked job URLs are still live |
| `npm run update:check` | Check for upstream career-ops updates |
| `npm run update` | Apply upstream updates (system-layer files only) |
| `npm run rollback` | Rollback last update |
| `bash batch/batch-runner.sh` | Run batch evaluation of URLs in `batch/batch-input.tsv` |
| `source .venv/bin/activate && pip install -r requirements.txt` | Install Python dependencies (JobSpy) |
| `source .venv/bin/activate && python3 jobspy-scan.py --search-term "..." --location "..."` | Scan job boards via JobSpy |
| `node linkedin-scan.mjs --keyword "..." --location "..." --limit 25` | Scan LinkedIn via linkedin-jobs-api |
| `cd dashboard && go build -o career-dashboard . && ./career-dashboard --path ..` | Build and run the Go TUI dashboard |

## Architecture

### Mode Dispatch

User input is classified and routed to a mode file in `modes/`. Each mode is a self-contained markdown prompt that defines a multi-step workflow. The loading order matters:

1. `modes/_shared.md` — System-level scoring rules, archetype definitions, global rules, tool config (auto-updatable)
2. `modes/_profile.md` — User's archetypes, narrative, negotiation scripts, comp targets (never auto-updated, overrides `_shared.md`)
3. The specific mode file (e.g., `modes/oferta.md`, `modes/scan.md`)

All modes also read `modes/obsidian-bridge.md` for vault path resolution and frontmatter conventions.

### Two-Layer Data Contract

Files are split into **User Layer** (never auto-updated) and **System Layer** (safe to replace with upstream). See `DATA_CONTRACT.md` for the complete list. The critical rule: user customizations (archetypes, narrative, comp targets) go in `modes/_profile.md` or `config/profile.yml`, NEVER in `modes/_shared.md`.

### Skill Delegation

Three modes delegate to external Claude Code skills rather than implementing their own workflows:

| Mode | Delegates to | Fallback |
| ---- | ------------ | -------- |
| `pdf` | `tailored-resume-generator` skill | Built-in `generate-pdf.mjs` + `templates/cv-template.html` |
| `interview-prep` | `interview-prep` + `mock-interview-transcript` skills | Built-in interview research workflow |
| `interview-prep` (case studies) | `pm-vibe-coding` skill | None |

Each delegation mode gathers context (JD, CV, evaluation keywords), invokes the skill, saves output to the Obsidian vault, and updates JD frontmatter.

### Obsidian Bases Tracker

The tracker at `{vault}/00_Strategy/Tracker_2026.base` is an Obsidian Bases database that reads YAML frontmatter from files in `{vault}/10_JD_Pool/`. There is no separate tracker file — updating a JD file's frontmatter (`status`, `score`, `Tier`, `pdf_generated`) automatically updates the tracker. All modes that create or evaluate JDs write to `10_JD_Pool/` files directly.

## Data Contract (CRITICAL)

There are two layers. Read `DATA_CONTRACT.md` for the full list.

**User Layer (NEVER auto-updated, personalization goes HERE):**
- `cv.md`, `config/profile.yml`, `modes/_profile.md`, `article-digest.md`
- Obsidian vault: `{vault}/10_JD_Pool/*`, `{vault}/20_Tailored_CV/*`, `{vault}/40_Interviewing/*`
- `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml`
- `{vault}/99_The_Treasure_Vault/01_Career_Ops/target-companies.yml`
- `interview-prep/story-bank.md`

**System Layer (auto-updatable, DON'T put user data here):**
- `modes/_shared.md`, `modes/oferta.md`, all other modes
- `CLAUDE.md`, `*.mjs` scripts, `templates/*`

**THE RULE: When the user asks to customize anything (archetypes, narrative, negotiation scripts, proof points, location policy, comp targets), ALWAYS write to `modes/_profile.md` or `config/profile.yml`. NEVER edit `modes/_shared.md` for user-specific content.**

## Obsidian Integration

**This system reads and writes to the user's Obsidian vault.** Read `modes/obsidian-bridge.md` for the complete integration spec.

**Vault base path:** Read from `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml` at runtime. Alternatively, the env var `CAREER_OPS_VAULT_PATH` can be set to override the default. **Never hardcode an absolute vault path in code or docs.**

### Key Vault Folders

| Folder | Purpose |
| ------ | ------- |
| `00_Strategy/` | Career goals, Bases tracker |
| `10_JD_Pool/` | All discovered JDs (one file each with YAML frontmatter) |
| `20_Tailored_CV/` | Resume output (from `tailored-resume-generator` skill) |
| `30_Applied/` | Submitted applications |
| `40_Interviewing/` | Interview prep (from `interview-prep` skill) |
| `50_Offers/` | Received offers |
| `90_Archived_Roles/` | Closed/rejected roles |
| `99_The_Treasure_Vault/01_Career_Ops/` | System config, company list, scan history |

### Tracker

The tracker is `00_Strategy/Tracker_2026.base` — an Obsidian Bases database that automatically reads frontmatter from files in `10_JD_Pool/`. **Do NOT maintain a separate `applications.md`.** Update JD file frontmatter and Bases picks it up.

## What is career-ops

AI-powered job search automation: pipeline tracking, offer evaluation, dynamic company discovery, portal scanning, with resume and interview prep delegated to the user's own specialized skills.

### Main Files

| File | Function |
| ---- | -------- |
| `{vault}/10_JD_Pool/*.md` | JD files with YAML frontmatter (tracker source) |
| `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml` | User targeting config |
| `{vault}/99_The_Treasure_Vault/01_Career_Ops/target-companies.yml` | Dynamic company list |
| `{vault}/99_The_Treasure_Vault/01_Career_Ops/scan-history.tsv` | Scanner dedup history |
| `cv.md` | Canonical CV |
| `article-digest.md` | Detailed proof points (optional) |
| `interview-prep/story-bank.md` | Accumulated STAR+R stories |
| `config/profile.yml` | Candidate identity and targets |
| `modes/_profile.md` | User archetypes, narrative, negotiation |

### Skill Modes

| If the user... | Mode | Notes |
| -------------- | ---- | ----- |
| Pastes JD or URL | `auto-pipeline` | Evaluate + resume + tracker update |
| Asks to evaluate offer | `oferta` | A-F scoring, inline in JD file |
| Asks to compare offers | `ofertas` | Compare and rank multiple JDs |
| Wants to discover companies | `discover-companies` | **NEW** — Dynamic company list |
| Searches for new offers | `scan` | **UPDATED** — APAC/China boards |
| Wants to generate resume | `pdf` | **DELEGATED** → `tailored-resume-generator` skill |
| Preps for interview | `interview-prep` | **DELEGATED** → `interview-prep` + `mock-interview-transcript` skills |
| Wants LinkedIn outreach | `contacto` | LinkedIn outreach message |
| Asks for company research | `deep` | Deep company research |
| Evaluates a course/cert | `training` | Training evaluation |
| Evaluates portfolio project | `project` | Project evaluation |
| Asks about rejection patterns | `patterns` | Analyze and improve targeting |
| Fills out application form | `apply` | Application assistant |

### First Run — Onboarding (IMPORTANT)

**Before doing ANYTHING else, check if the system is set up.** Run these checks silently every time a session starts:

1. Does `cv.md` exist?
2. Does `config/profile.yml` exist?
3. Does `modes/_profile.md` exist?
4. Does `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml` exist?

If `modes/_profile.md` is missing, copy from `modes/_profile.template.md` silently.

**If ANY of these is missing, enter onboarding mode.** Guide the user step by step.

#### Step 1: CV (required)
If `cv.md` is missing, ask the user to provide their CV (paste, LinkedIn URL, or describe experience).

#### Step 2: Profile (required)
If `config/profile.yml` is missing, copy from `config/profile.example.yml` and ask for details.

#### Step 3: Obsidian Config (required)
If `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml` is missing, create it from the template with the user's targeting preferences.

#### Step 4: Company Discovery (recommended)
If `target-companies.yml` is empty, run `discover-companies` mode to generate a dynamic company list.

#### Step 5: Get to know the user
Ask about superpower, deal-breakers, best achievement, proof points. Store in `config/profile.yml` and `modes/_profile.md`.

#### Step 6: Ready
```
You're all set! You can now:
- Paste a job URL to evaluate it
- Run discover-companies to build your target list
- Run scan to find new positions
- Run interview-prep for any company

Everything is customizable — just ask.
```

### CV Source of Truth

- `cv.md` in project root is the canonical CV
- `article-digest.md` has detailed proof points (optional)
- **NEVER hardcode metrics** — read them from these files at evaluation time

---

## Ethical Use — CRITICAL

**Quality, not quantity.** Never submit an application without user review. Strongly discourage applications scoring below 4.0/5. Respect recruiters' time.

---

## Offer Verification — MANDATORY

**NEVER trust WebSearch/WebFetch to verify if an offer is still active.** ALWAYS use Playwright:
1. `browser_navigate` to the URL
2. `browser_snapshot` to read content
3. Only footer/navbar without JD = closed. Title + description + Apply = active.

---

## Stack and Conventions

- Node.js (mjs modules), Playwright (scanning + verification), YAML (config), Markdown (data)
- Python 3.10+ (JobSpy wrapper — `jobspy-scan.py`). Requires venv: `.venv/`
- Scripts in `.mjs`, configuration in YAML
- JD files in Obsidian vault `10_JD_Pool/` (not local `jds/` folder)
- Resume output in Obsidian vault `20_Tailored_CV/` (delegated to skill)
- Interview prep in Obsidian vault `40_Interviewing/` (delegated to skill)
- **All output is in English.**
- **No separate `applications.md` tracker.** JD file frontmatter is the single source of truth.

### Frontmatter Status Lifecycle

`new` → `evaluated` → `applied` → `interviewing` → `offered` → `archived`; or `rejected`/`discarded` → `archived` at any point. Update status in the JD file's YAML frontmatter — the Bases tracker reads it automatically.
