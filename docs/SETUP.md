# Setup Guide

## Prerequisites

- [Claude Code](https://claude.ai/code) installed and configured
- Node.js 18+ (for PDF generation and utility scripts)
- (Optional) Go 1.21+ (for the dashboard TUI)

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/santifer/career-ops.git
cd career-ops
npm install
npx playwright install chromium   # Required for PDF generation and portal checks
```

### 2. Configure your profile

```bash
cp config/profile.example.yml config/profile.yml
```

Edit `config/profile.yml` with your personal details: target roles, narrative, proof points, and preferences.

### 3. Add your CV

Create `cv.md` in the project root with your full CV in markdown format. This is the source of truth for evaluations and PDFs.

(Optional) Create `article-digest.md` with proof points from your portfolio projects/articles.

### 4. Complete Obsidian onboarding

Open Claude Code in this directory:

```bash
claude
```

Claude will guide you through the required Obsidian-native setup:
- create or populate `modes/_profile.md`
- configure the Obsidian vault integration
- confirm your JD workflow uses vault files in `10_JD_Pool/`
- set up your target-company workflow in the vault config area

### 5. Verify setup

```bash
npm run doctor
```

Then paste a job offer URL or description. Career-Ops will evaluate it, update the JD note in your vault, and drive the tailored PDF/interview workflow from that note.

## Available Commands

| Action | How |
|--------|-----|
| Evaluate an offer | Paste a URL or JD text |
| Discover target companies | `/career-ops discover-companies` |
| Search for offers | `/career-ops scan` |
| Process pending URLs | `/career-ops pipeline` |
| Generate a PDF | `/career-ops pdf` |
| Batch evaluate | `/career-ops batch` |
| Check tracker status | `/career-ops tracker` |
| Fill application form | `/career-ops apply` |

## Verify Setup

```bash
npm run doctor              # Check prerequisites and onboarding state
npm run verify              # Validate JD frontmatter in the Obsidian vault
```

## Build Dashboard (Optional)

```bash
cd dashboard
go build -o career-dashboard .
./career-dashboard --path ..  # Opens TUI pipeline viewer
```
