# Architecture

## System Overview

```
                    ┌─────────────────────────────────┐
                    │         Claude Code Agent        │
                    │   (reads CLAUDE.md + modes/*.md) │
                    └──────────┬──────────────────────┘
                               │
            ┌──────────────────┼──────────────────────┐
            │                  │                       │
     ┌──────▼──────┐   ┌──────▼──────┐   ┌───────────▼────────┐
     │ Single Eval  │   │ Portal Scan │   │   Batch Process    │
     │ (auto-pipe)  │   │  (scan.md)  │   │   (batch-runner)   │
     └──────┬──────┘   └──────┬──────┘   └───────────┬────────┘
            │                  │                       │
            │           ┌──────▼──────┐          ┌────▼─────┐
            │           │ pipeline.md │          │ N workers│
            │           │ (URL inbox) │          │ (claude -p)
            │           └─────────────┘          └────┬─────┘
            │                                          │
     ┌──────▼──────────────────────────────────────────▼──────┐
     │                    Output Pipeline                      │
     │  ┌──────────┐  ┌────────────┐  ┌───────────────────┐  │
     │  │ Report.md│  │  PDF (HTML  │  │ JD Frontmatter    │  │
     │  │ (A-F eval)│  │  → Playwright)│  │ (status/score)   │  │
     │  └──────────┘  └────────────┘  └───────────────────┘  │
     └────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │  Obsidian Vault           │
                    │  10_JD_Pool/ (frontmatter │
                    │  → Bases tracker)         │
                    └──────────────────────────┘
```

## Evaluation Flow (Single Offer)

1. **Input**: User pastes JD text or URL
2. **Extract**: Playwright/WebFetch extracts JD from URL
3. **Classify**: Detect archetype (1 of 6 types)
4. **Evaluate**: 6 blocks (A-F):
   - A: Role summary
   - B: CV match (gaps + mitigation)
   - C: Level strategy
   - D: Comp research (WebSearch)
   - E: CV personalization plan
   - F: Interview prep (STAR stories)
5. **Score**: Weighted average across 10 dimensions (1-5)
6. **Write JD note**: Append evaluation output inline to the JD file in `{vault}/10_JD_Pool/`
7. **PDF**: Generate ATS-optimized CV (`generate-pdf.mjs`)
8. **Track**: Update JD file frontmatter in `{vault}/10_JD_Pool/` — Obsidian Bases reads it automatically

## Batch Processing

The batch system processes multiple offers in parallel:

```
batch-input.tsv    →  batch-runner.sh  →  N × claude -p workers
(id, url, source)     (orchestrator)       (self-contained prompt)
                           │
                    batch-state.tsv
                    (tracks progress)
```

Each worker is a headless Claude instance (`claude -p`) that receives the full `batch-prompt.md` as context. Workers produce:
- Report .md
- PDF
- JD frontmatter update (status, score, archetype)

The orchestrator manages parallelism, state, retries, and resume.

## Data Flow

```
cv.md                         →  Evaluation context
article-digest.md             →  Proof points for matching
config/profile.yml            →  Candidate identity
vault config + target lists   →  Discovery and scan inputs
templates/cv-template.html    →  PDF generation template
```

## File Naming Conventions

- PDFs: `cv-candidate-{company-slug}-{YYYY-MM-DD}.pdf`
- JD files: `{Role} | {Company} | {Source}.md` (in vault `10_JD_Pool/`)
- Tracker state: YAML frontmatter inside the JD file

## Pipeline Integrity

| Script | Purpose |
|--------|---------|
| `verify-pipeline.mjs` | Health check: validates JD file frontmatter (statuses, scores, fields, duplicates) |
| `test-all.mjs` | Full test suite: syntax, data contract, modes, paths |
| `doctor.mjs` | Pre-flight checks: Node version, Playwright, required files |

> **Deprecated:** `normalize-statuses.mjs`, `dedup-tracker.mjs`, `merge-tracker.mjs` operated on the legacy `applications.md` tracker and are no longer used. Pipeline integrity is managed through Obsidian vault JD frontmatter.

## Tracker: Obsidian Bases

The application tracker is **not** a standalone file. The Obsidian Bases database at `00_Strategy/Tracker_2026.base` reads YAML frontmatter from `10_JD_Pool/*.md` files automatically.

**Canonical status lifecycle:**
`new` → `evaluated` → `applied` → `interviewing` → `offered` → `archived`; or `rejected`/`discarded` → `archived` at any point.

## Dashboard TUI

The `dashboard/` directory contains a standalone Go TUI application that visualizes the pipeline:

- Filter tabs: All, Evaluated, Applied, Interviewing, Top >=4, Discarded
- Sort modes: Score, Date, Company, Status
- Grouped/flat view
- Lazy-loaded report previews
- Inline status picker
