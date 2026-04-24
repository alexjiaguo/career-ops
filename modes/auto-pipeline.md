# Mode: auto-pipeline — Full Automatic Pipeline (Obsidian-Native)

When the user pastes a JD (text or URL) without an explicit sub-command, execute the full pipeline in sequence. All outputs go to the Obsidian vault.

## Prerequisites

Read `modes/obsidian-bridge.md` for vault paths and frontmatter conventions.

## Step 0 — Extract JD

If the input is a **URL** (not pasted JD text):

**Priority order:**
1. **Playwright (preferred):** Most job portals (Lever, Ashby, Greenhouse, Workday) are SPAs. Use `browser_navigate` + `browser_snapshot` to render and read the JD.
2. **WebFetch (fallback):** For static pages (ZipRecruiter, company career pages).
3. **WebSearch (last resort):** Search for role title + company on secondary portals that index the JD in static HTML.

**If no method works:** Ask the user to paste the JD manually or share a screenshot.

**If the input is pasted JD text:** Use directly, no fetch needed.

## Step 1 — Save JD to Obsidian Vault

Before evaluating, save the JD as a file in `{vault}/10_JD_Pool/`:

**File name:** `{Role Title} | {Company} | {Source}.md`
- `{Source}` = "LinkedIn", "Careers", "BOSS直聘", etc.

**Content:**
```markdown
---
title: "{Role Title} | {Company} | {Source}"
source: "{url or 'manual paste'}"
created: {YYYY-MM-DD}
tags:
  - jobs
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

{Full JD content}
```

If the file already exists in `10_JD_Pool/` (same company + similar role), update it instead of creating a duplicate.

## Step 2 — Evaluation A-F

Execute exactly as the `oferta` mode (read `modes/oferta.md` for all blocks A-F).

**After evaluation, update the JD file's frontmatter:**
```yaml
status: evaluated
score: "{X.X}/5"
Tier: "Tier {1|2|3}"
archetype: "{detected archetype}"
description: "{one-line TL;DR}"
tags:
  - jobs
  - {archetype-tag}     # e.g., ai-pm
  - {location-tag}      # e.g., beijing
  - tier-{1|2|3}
```

**Append the evaluation** to the JD file as inline sections:

```markdown
---

## Evaluation — {YYYY-MM-DD}

### A) Role Summary
{block A content}

### B) CV Match
{block B content}

### C) Level & Strategy
{block C content}

### D) Comp & Demand
{block D content}

### E) Personalization Plan
{block E content}

### F) Interview Plan
{block F content}

### Keywords Extracted
{15-20 JD keywords for ATS optimization}
```

## Step 3 — Generate Tailored Resume (Delegated)

**Delegate to the `tailored-resume-generator` skill.** Read `modes/pdf.md` for delegation details.

Pass to the skill:
- The JD content from the file
- The evaluation's keyword list and personalization plan (Block E)

Output goes to `{vault}/20_Tailored_CV/{Company} {Role}/`

After resume generation, update the JD file frontmatter:
```yaml
pdf_generated: true
```

## Step 4 — Draft Application Answers (only if score >= 4.5)

If the final score is >= 4.5, generate draft answers for the application form.

1. **Extract form questions**: Use Playwright to navigate to the application form and snapshot. If extraction fails, use generic questions.
2. **Generate answers** following the tone guidelines below.
3. **Append to the JD file** as section `## Draft Application Answers`.

### Generic Questions (use if form questions can't be extracted)

- Why are you interested in this role?
- Why do you want to work at {Company}?
- Tell us about a relevant project or achievement
- What makes you a good fit for this position?
- How did you hear about this role?

### Tone for Form Answers

**Position: "I'm choosing you."** — the candidate has options and is choosing this company for concrete reasons.

**Tone rules:**
- **Confident without arrogance**: "I've spent the past year building production AI agent systems — your role is where I want to apply that experience next"
- **Selective without haughtiness**: "I've been intentional about finding a team where I can contribute meaningfully from day one"
- **Specific and concrete**: Always reference something REAL from the JD or company + something REAL from the candidate's experience
- **Direct, no fluff**: 2-4 sentences per answer. No "I'm passionate about..." or "I would love the opportunity to..."
- **The hook is the proof, not the claim**: Instead of "I'm great at X", say "I built X that does Y"

**Framework per question:**
- **Why this role?** → "Your {specific thing} maps directly to {specific thing I built}."
- **Why this company?** → Mention something concrete. "I've been using {product} for {time/purpose}."
- **Relevant experience?** → One quantified proof point.
- **Good fit?** → "I sit at the intersection of {A} and {B}, which is exactly where this role lives."
- **How did you hear?** → Honest: "Found through {source}, evaluated against my criteria."

**Language**: Always English.

## Step 5 — Update Tracker

The Obsidian Bases tracker at `00_Strategy/Tracker_2026.base` automatically reads from JD file frontmatter. By updating the frontmatter in Steps 2-3, the tracker is already updated.

No separate `applications.md` or TSV file needed.

## Error Handling

**If any step fails**, continue with the remaining steps and note the failure:
- Append `> [!warning] Pipeline Note: {step} failed — {reason}` to the JD file
- Continue with next steps
