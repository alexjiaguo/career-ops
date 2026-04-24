# Mode: tracker — Application Dashboard

Reads JD files from the Obsidian vault's `10_JD_Pool/` directory and displays a dashboard.

**Data source:** JD file YAML frontmatter in `{vault}/10_JD_Pool/`. The Obsidian Bases tracker at `00_Strategy/Tracker_2026.base` reads this frontmatter automatically.

**Dashboard format:**
```markdown
| # | Date | Company | Role | Score | Status | Tier | Archetype |
```

Canonical statuses: `new` → `evaluated` → `applied` → `interviewing` → `offered` / `rejected` / `discarded` → `archived`

If the user asks to update a status, edit the frontmatter `status:` field in the corresponding JD file.

Also show statistics:
- Total JD files
- Count by status
- Average score
- % with score assigned
- % at each tier
