# Mode: interview-prep — Interview Preparation (Delegated)

This mode delegates interview preparation to the user's own skills:
- **`interview-prep`** — 3-version generation, SPIN/Gap Selling, AECR objection handling, debrief templates
- **`mock-interview-transcript`** — Converts guides into conversational practice scripts
- **`pm-vibe-coding`** — For PM vibe coding / product design case study interviews

## When to Use

- User asks to prep for an interview at a specific company
- An evaluation scores 4.0+ and the user updates status to `Interview`
- User says "prep for interview", "interview practice", or names a company+role

## Workflow

### Step 1 — Gather Context

1. **Read the JD file** from `{vault}/10_JD_Pool/{company-role}.md`
   - Extract full JD content
   - Extract evaluation (Blocks A-F) if it exists
   - Note the archetype, score, and identified gaps
2. **Read the user's CV** from `cv.md`
3. **Read proof points** from `article-digest.md` (if exists)
4. **Read existing story bank** from `interview-prep/story-bank.md` (if exists in project root)
5. **Read profile** from `config/profile.yml` and `modes/_profile.md`
6. **Check existing prep** in `{vault}/40_Interviewing/` for this company

### Step 2 — Research (Quick)

Before delegating, gather company-specific intelligence:

| Query | What to extract |
|-------|-----------------| 
| `"{company} {role} interview" site:glassdoor.com` | Process, questions, difficulty, timeline |
| `"{company} interview" site:teamblind.com` | Candid experiences, comp data, hiring bar |
| `"{company} engineering blog"` | Tech stack, values, priorities |
| `"{company} interview process {role}"` | General intel from blog posts, YouTube, prep guides |

**Do NOT fabricate questions.** Only report what was actually found. Label inferred questions as `[inferred from JD]`.

### Step 3 — Create Interview Folder

Create directory in vault:
```
{vault}/40_Interviewing/{Company} {Role}/
```

### Step 4 — Invoke interview-prep Skill

Delegate to the `interview-prep` skill with:
- Complete JD content
- Research findings from Step 2
- User's CV and proof points
- Existing story bank entries
- The evaluation report (if exists)

The skill will autonomously:
1. Generate 3 versions of interview answers (Operator / Strategist / Hybrid)
2. Run comparative evaluation with 9 scoring criteria
3. Cherry-pick the best elements into a composite
4. Perform a 7-dimension audit
5. Optimize through iteration
6. Generate cue cards for each answer

### Step 5 — Invoke mock-interview-transcript Skill (Optional)

If the user wants to practice, delegate to `mock-interview-transcript` with:
- The interview guide generated in Step 4

The skill will generate realistic conversational practice scripts.

### Step 6 — Invoke pm-vibe-coding Skill (If Applicable)

If the role involves product design case studies or vibe coding interviews:
- Delegate to `pm-vibe-coding` skill
- 5-step workflow: Frame → Diverge → Converge → Ship → Defend

### Step 7 — Save All Outputs

Save everything to `{vault}/40_Interviewing/{Company} {Role}/`:
- Interview guide (main output from `interview-prep` skill)
- Mock transcript (if generated)
- Vibe coding prep (if applicable)
- Research notes

### Step 8 — Update JD File

Update the JD file's frontmatter in `10_JD_Pool/`:
```yaml
status: interviewing
```

And append a link:
```markdown
> [!tip] Interview Prep Ready
> Full prep materials at [[40_Interviewing/{Company} {Role}/]]
> Created: {YYYY-MM-DD}
```

### Step 9 — Story Bank Update

If new STAR+R stories were generated during prep:
- Append them to `interview-prep/story-bank.md` in project root
- These accumulate across all interview preps as reusable stories

## What This Mode Does NOT Do

- **Does NOT use the generic career-ops interview research template** — the user's skill has a superior multi-version, audit-optimized workflow
- **Does NOT generate answers in the career-ops default format** — defers entirely to the user's skill

## Post-Interview

After the interview, suggest:
- Update JD file status: `interviewing` → `offered` / `rejected`
- Run the debrief template from `interview-prep` skill
- Move file to `50_Offers/` or `90_Archived_Roles/` as appropriate

## Fallback

If the `interview-prep` skill is not available:
1. Notify the user: "The interview-prep skill is not installed. Would you like me to use the built-in interview research mode instead?"
2. If yes, run the original career-ops interview research workflow (Steps 1-7 from the original `interview-prep.md`)
