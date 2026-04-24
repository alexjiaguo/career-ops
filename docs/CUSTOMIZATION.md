# Customization Guide

## Profile (config/profile.yml)

This is the single source of truth for your identity. All modes read from here.

Key sections:
- **candidate**: Name, email, phone, location, LinkedIn, portfolio
- **target_roles**: Your North Star roles and archetypes
- **narrative**: Your headline, exit story, superpowers, proof points
- **compensation**: Target range, minimum, currency
- **location**: Country, timezone, visa status, on-site availability

## Target Roles (modes/_profile.md)

Keep your personal archetypes and framing in `modes/_profile.md`, not `_shared.md`.

Customize:

1. Your target archetypes
2. The proof points to emphasize for each archetype
3. Your exit narrative and positioning
4. Your negotiation framing

## Company Discovery Targets (Obsidian vault)

Maintain company targeting in the Obsidian vault config area:

- `{vault}/99_The_Treasure_Vault/01_Career_Ops/config.yml`
- `{vault}/99_The_Treasure_Vault/01_Career_Ops/target-companies.yml`

Use that vault-side config to tune:
1. Positive/negative title filters
2. Search queries for supported job boards
3. Tracked companies to check directly
4. Location and geo preferences for discovery

## CV Template (templates/cv-template.html)

The HTML template uses these design tokens:
- **Fonts**: Space Grotesk (headings) + DM Sans (body) -- self-hosted in `fonts/`
- **Colors**: Cyan primary (`hsl(187,74%,32%)`) + Purple accent (`hsl(270,70%,45%)`)
- **Layout**: Single-column, ATS-optimized

To customize fonts/colors, edit the CSS in the template. Update font files in `fonts/` if switching fonts.

## Negotiation Scripts (modes/_shared.md)

The negotiation section provides frameworks for salary discussions. Replace the example scripts with your own:
- Target ranges
- Geographic arbitrage strategy
- Pushback responses

## Hooks (Optional)

Career-ops can integrate with external systems via Claude Code hooks. Example hooks:

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "echo 'Career-ops session started'"
      }]
    }]
  }
}
```

Save hooks in `.claude/settings.json`.

## States (templates/states.yml)

The canonical states rarely need changing. If you add new states, update:
1. `templates/states.yml`
2. Any frontmatter validation that depends on the canonical list
3. Any mode instructions that mention the lifecycle
