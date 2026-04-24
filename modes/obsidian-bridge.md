# Mode: obsidian-bridge — Obsidian Vault Integration Layer

This mode defines how career-ops integrates with the user's Obsidian vault. All other modes reference this file for path resolution, frontmatter conventions, and output formatting.

## Configuration

Read the config file at the vault path:
```
{vault_base}/99_The_Treasure_Vault/01_Career_Ops/config.yml
```

The `vault.base_path` in config.yml is the root of all vault operations.

## Folder Mapping

| Career-Ops Concept | Obsidian Folder | Format |
|---|---|---|
| Discovered JDs | `{vault}/10_JD_Pool/` | One `.md` file per JD with YAML frontmatter |
| Evaluation reports | Appended inline to JD file in `10_JD_Pool/` | Sections `## Evaluation` added to the JD file |
| Tailored CVs | `{vault}/20_Tailored_CV/{Company Role}/` | Delegated to `tailored-resume-generator` skill |
| Applied tracking | `{vault}/30_Applied/` | Move/copy JD file here when applied |
| Interview prep | `{vault}/40_Interviewing/{Company Role}/` | Delegated to `interview-prep` skill |
| Offers | `{vault}/50_Offers/` | Move JD file here when offer received |
| Archived | `{vault}/90_Archived_Roles/` | Move JD file here when closed/rejected |
| System config | `{vault}/99_The_Treasure_Vault/01_Career_Ops/` | config.yml, target-companies.yml |
| Company intel | `{vault}/99_The_Treasure_Vault/04_Company_Intel/` | Deep research outputs |
| Tracker | `{vault}/00_Strategy/Tracker_2026.base` | Obsidian Bases DB — reads from `10_JD_Pool/` frontmatter |

## Frontmatter Convention

Every JD file in `10_JD_Pool/` MUST have this YAML frontmatter:

```yaml
---
title: "Role Title | Company | Source"
source: "https://original-url.com/..."
created: YYYY-MM-DD
tags:
  - jobs
  - {archetype-tag}     # e.g., ai-pm, llmops, agentic
  - {location-tag}      # e.g., beijing, singapore, remote
status: new              # new → evaluated → applied → interviewing → offered → archived
Tier:                    # Tier 1 (strong match) / Tier 2 (good match) / Tier 3 (weak match)
score:                   # Evaluation score X.X/5 (filled after evaluation)
company: "Company Name"
location: "City, Country"
remote: "onsite|hybrid|remote"
archetype:               # AI PM / LLMOps / Agentic / SA / FDE / Transformation
pdf_generated: false
description: "One-line TL;DR"
---
```

### Status Lifecycle

```
new → evaluated → applied → interviewing → offered → archived
                                                  ↘ rejected → archived
                              ↘ discarded → archived
```

### Tier Assignment (after evaluation)

| Score | Tier | Meaning |
|-------|------|---------|
| 4.0+ | Tier 1 | Strong match — apply immediately |
| 3.5–3.9 | Tier 2 | Good match — apply if specific reason |
| Below 3.5 | Tier 3 | Weak match — recommend against applying |

## Tracker Integration

The Obsidian Bases tracker at `00_Strategy/Tracker_2026.base` automatically reads from files in `10_JD_Pool/` using frontmatter properties. No manual tracker updates needed — the system updates frontmatter fields (`status`, `score`, `Tier`, `pdf_generated`) and Bases picks them up.

### Updating Tracker State

To update a JD's status:
1. Read the JD file from `10_JD_Pool/`
2. Modify the YAML frontmatter field (e.g., `status: evaluated`, `score: 4.2/5`)
3. Write the file back

Do NOT maintain a separate `applications.md` tracker. The Bases DB is the single source of truth.

## File Naming Convention

JD files: `{Role Title} | {Company} | {Source}.md`
- Match the existing convention in `10_JD_Pool/` (see existing files for reference)
- Examples:
  - `Senior AI Product Manager | ByteDance | LinkedIn.md`
  - `AI Product Manager | Grab | Careers.md`
  - `ai产品经理 | 字节跳动 | BOSS直聘.md`

## Obsidian-Specific Features

### Wikilinks
- Use `[[filename]]` for cross-references within the vault
- Link evaluation to company intel: `[[04_Company_Intel/{company}]]`
- Link to interview prep: `[[40_Interviewing/{Company Role}/]]`

### Tags
Always use lowercase, hyphenated tags:
- `#jobs`, `#ai-pm`, `#tier-1`, `#beijing`, `#singapore`, `#remote`
- `#evaluated`, `#applied`, `#interviewing`

### Callouts
Use Obsidian callout syntax for highlights in evaluations:
```markdown
> [!tip] Strong Match
> This role maps directly to your ad-tech background...

> [!warning] Gap Identified
> Requires 7+ years PM experience, you have 5...
```

## Language

All output is in **English only**, regardless of JD language. If the JD is in Chinese, extract and translate key requirements before evaluating.
