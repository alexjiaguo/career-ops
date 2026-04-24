# Discovery Mode: Agent-Led Automation

This document defines the protocol for automated job discovery and scanning using the AI agent's native capabilities (`search_web`, `browser_subagent`).

## Overview

Due to local network restrictions on standalone scripts (`ats-scanner.mjs`), the discovery phase is delegated to the AI agent. The agent performs batch scans of target companies and populates the `10_JD_Pool/` for evaluation.

## 🔄 Scanning Protocol

### 1. Target Definition
The agent uses `config/profile.yml` and `config/target-companies.yml` (if available) to identify roles and companies.

### 2. Search Strategy
The agent runs web searches using the pattern:
`[Role Archetype] jobs [Company] [Location] 2026`

### 3. Extraction
- **Primary**: `browser_subagent` navigates to career portals and extracts full JD text.
- **Fallback**: `read_url_content` for lightweight sites or mirrored listings (Indeed, LinkedIn).

### 4. Categorization
- JDs are saved as Markdown files in `10_JD_Pool/`.
- Frontmatter is automatically populated with `status: new`.

## 🛠 Automation Trigger

To trigger a scan, use the following command (handled by the agent):
`antigravity execute scan --targets=tier-1`

## 📈 Structured Job Board Scraping (JobSpy)

For standalone batch scanning, use `jobspy-scan.py` — scrapes LinkedIn, Indeed, Glassdoor, and Google Jobs without any API key.

### Usage:
```bash
# Direct query
python3 jobspy-scan.py --search-term "AI product manager" --location "Singapore" --sites linkedin,indeed,google --results 50

# Config-driven (auto-generates queries from config.yml roles × locations)
python3 jobspy-scan.py --config {vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml
```

Outputs structured JSON to stdout. See `scan.md` Level 2a for full integration details.

> [!TIP]
> Install with: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
