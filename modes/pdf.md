# Mode: pdf — Resume Generation (Delegated to tailored-resume-generator)

This mode delegates resume/CV generation to the user's `tailored-resume-generator` skill, which provides 3-version MD generation, 9 HTML templates, comparative evaluation, and an audit & optimize loop.

## When to Use

- User asks to generate a tailored resume for a specific job
- Auto-pipeline reaches the resume generation step
- User says "generate CV", "create resume", or "tailor my resume"

## Workflow

### Step 1 — Gather Inputs

1. **Read the JD file** from `{vault}/10_JD_Pool/{company-role}.md`
   - Extract the full JD content (below the frontmatter)
   - Extract the evaluation keywords list (if evaluation exists)
   - Extract the personalization plan (Block E, if exists)
2. **Read the user's CV** from `cv.md` in project root
3. **Read proof points** from `article-digest.md` (if exists)
4. **Read profile** from `config/profile.yml` and `modes/_profile.md`

### Step 2 — Invoke tailored-resume-generator Skill

Delegate to the `tailored-resume-generator` skill with:
- The complete JD content
- The user's CV content
- The evaluation keywords and personalization plan (as additional context)
- Any user-specified preferences (template choice, emphasis areas)

The skill will autonomously:
1. Analyze the JD and extract key requirements
2. Generate 3 resume versions (Impact-Led / Technical-Led / Narrative-Led)
3. Run a comparative evaluation and score each version
4. Perform a 4-dimension audit (Role Fit, Background Utilization, Format, Tone)
5. Optimize the winning version through an iterative loop

### Step 3 — Save Output

Save the skill's output to:
```
{vault}/20_Tailored_CV/{Company} {Role}/
```

This may include:
- Markdown resume versions
- HTML resume files (from the skill's template system)
- PDF exports

### Step 4 — Update JD File

After resume generation, update the JD file's frontmatter:
```yaml
pdf_generated: true
```

And append a note:
```markdown
> [!tip] Resume Generated
> Tailored resume saved to [[20_Tailored_CV/{Company} {Role}/]]
> Generated: {YYYY-MM-DD}
```

## What This Mode Does NOT Do

- **Does NOT use the career-ops HTML template** (`templates/cv-template.html`) — the user's skill has its own superior template system
- **Does NOT run `generate-pdf.mjs`** — the user's skill handles PDF generation
- **Does NOT use Canva MCP** — delegated to the skill's workflow

## Fallback

If the `tailored-resume-generator` skill is not available:
1. Notify the user: "The tailored-resume-generator skill is not installed. Would you like me to use the built-in HTML template instead?"
2. If yes, fall back to the original career-ops PDF pipeline (read `templates/cv-template.html`, use `generate-pdf.mjs`)
