# Modo: oferta — Evaluación Completa A-F

Cuando el candidato pega una oferta (texto o URL), entregar SIEMPRE los 6 bloques:

## Paso 0 — Detección de Arquetipo

Clasificar la oferta en uno de los 6 arquetipos (ver `_shared.md`). Si es híbrido, indicar los 2 más cercanos. Esto determina:
- Qué proof points priorizar en bloque B
- Cómo reescribir el summary en bloque E
- Qué historias STAR preparar en bloque F

## Bloque A — Resumen del Rol

Tabla con:
- Arquetipo detectado
- Domain (platform/agentic/LLMOps/ML/enterprise)
- Function (build/consult/manage/deploy)
- Seniority
- Remote (full/hybrid/onsite)
- Team size (si se menciona)
- TL;DR en 1 frase

## Bloque B — Match con CV

Lee `cv.md`. Crea tabla con cada requisito del JD mapeado a líneas exactas del CV.

**Adaptado al arquetipo:**
- Si FDE → priorizar proof points de delivery rápida y client-facing
- Si SA → priorizar diseño de sistemas e integrations
- Si PM → priorizar product discovery y métricas
- Si LLMOps → priorizar evals, observability, pipelines
- Si Agentic → priorizar multi-agent, HITL, orchestration
- Si Transformation → priorizar change management, adoption, scaling

Sección de **gaps** con estrategia de mitigación para cada uno. Para cada gap:
1. ¿Es un hard blocker o un nice-to-have?
2. ¿Puede el candidato demostrar experiencia adyacente?
3. ¿Hay un proyecto portfolio que cubra este gap?
4. Plan de mitigación concreto (frase para cover letter, proyecto rápido, etc.)

## Bloque C — Nivel y Estrategia

1. **Nivel detectado** en el JD vs **nivel natural del candidato para ese arquetipo**
2. **Plan "vender senior sin mentir"**: frases específicas adaptadas al arquetipo, logros concretos a destacar, cómo posicionar la experiencia de founder como ventaja
3. **Plan "si me downlevelan"**: aceptar si comp es justa, negociar review a 6 meses, criterios de promoción claros

## Bloque D — Comp y Demanda

Usar WebSearch para:
- Salarios actuales del rol (Glassdoor, Levels.fyi, Blind)
- Reputación de compensación de la empresa
- Tendencia de demanda del rol

Tabla con datos y fuentes citadas. Si no hay datos, decirlo en vez de inventar.

## Bloque E — Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---------|---------------|------------------|---------|
| 1 | Summary | ... | ... | ... |
| ... | ... | ... | ... | ... |

Top 5 cambios al CV + Top 5 cambios a LinkedIn para maximizar match.

## Bloque F — Plan de Entrevistas

6-10 historias STAR+R mapeadas a requisitos del JD (STAR + **Reflection**):

| # | Requisito del JD | Historia STAR+R | S | T | A | R | Reflection |
|---|-----------------|-----------------|---|---|---|---|------------|

The **Reflection** column captures what was learned or what would be done differently. This signals seniority — junior candidates describe what happened, senior candidates extract lessons.

**Story Bank:** If `interview-prep/story-bank.md` exists, check if any of these stories are already there. If not, append new ones. Over time this builds a reusable bank of 5-10 master stories that can be adapted to any interview question.

**Seleccionadas y enmarcadas según el arquetipo:**
- FDE → enfatizar velocidad de entrega y client-facing
- SA → enfatizar decisiones de arquitectura
- PM → enfatizar discovery y trade-offs
- LLMOps → enfatizar métricas, evals, production hardening
- Agentic → enfatizar orchestration, error handling, HITL
- Transformation → enfatizar adopción, cambio organizacional

Incluir también:
- 1 case study recomendado (cuál de sus proyectos presentar y cómo)
- Preguntas red-flag y cómo responderlas (ej: "¿por qué vendiste tu empresa?", "¿tienes equipo de reports?")

---

## Post-Evaluation (Obsidian-Native)

**ALWAYS** after generating blocks A-F:

### 1. Update JD File Frontmatter

Update the JD file in `{vault}/10_JD_Pool/` with evaluation results:

```yaml
status: evaluated
score: "{X.X}/5"
Tier: "Tier {1|2|3}"
archetype: "{detected archetype}"
description: "{one-line TL;DR from Block A}"
tags:
  - jobs
  - {archetype-tag}
  - {location-tag}
  - tier-{1|2|3}
```

**Tier assignment:**
- Score 4.0+ → Tier 1
- Score 3.5–3.9 → Tier 2
- Score below 3.5 → Tier 3

### 2. Append Evaluation Inline to JD File

Append the full evaluation below the JD content in the same file:

```markdown
---

## Evaluation — {YYYY-MM-DD}

**Archetype:** {detected}
**Score:** {X.X}/5
**Tier:** {1|2|3}

### A) Role Summary
(full Block A content)

### B) CV Match
(full Block B content)

### C) Level & Strategy
(full Block C content)

### D) Comp & Demand
(full Block D content)

### E) Personalization Plan
(full Block E content)

### F) Interview Plan
(full Block F content)

### G) Draft Application Answers
(only if score >= 4.5)

---

### Keywords Extracted
(15-20 JD keywords for ATS optimization)
```

### 3. Tracker Update (Automatic)

The Obsidian Bases tracker at `00_Strategy/Tracker_2026.base` reads frontmatter from JD files automatically. By updating frontmatter in Step 1, the tracker is already updated. **No separate applications.md or TSV needed.**

### 4. Story Bank

If STAR+R stories were generated in Block F, append new ones to `interview-prep/story-bank.md` (if it exists). These accumulate as reusable stories across evaluations.
