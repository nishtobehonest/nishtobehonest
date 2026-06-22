# Portfolio Enrichment Plan — nishchay.me

## Context
Add all missing projects, fix broken references, and add visual wow-factor differentiators. The portfolio should feel like a "thinking tool" not a resume list. Nish communicates visually, loves excalidraw-style flows, and wants easy prioritized navigation for any visitor type (recruiter, engineer, curious). Target: hiring managers at Series A/B startups in geospatial/operational AI.

---

## Phase 1 — Data Fixes & New Nodes (nodes.json only, no code)

### 1a. Fix broken edge
Add `ground-truth` node (currently referenced in `case-studies.connects_to` but missing):
```json
{
  "slug": "ground-truth",
  "title": "Ground Truth — Multi-Tab AI Dashboard",
  "type": "project", "domain": "ai-systems", "date": "2026-01",
  "tags": ["React", "Anthropic", "multi-tab", "system-prompts"],
  "status": "shipped", "tier": 2, "link": "",
  "description": "React + Anthropic API dashboard with per-tab system prompts — each tab rebuilds context from scratch so queries resolve correctly regardless of active tab.",
  "proves": "Context isolation at the application layer",
  "connects_to": ["case-studies", "decision-intelligence-agent"]
}
```

### 1b. Add pipeline-risk-intelligence-agent (Tier 1 — most important missing node)
```json
{
  "slug": "pipeline-risk-intelligence-agent",
  "title": "Pipeline Risk Intelligence Agent",
  "type": "project", "domain": "ai-systems", "date": "2026-06",
  "tags": ["Apache-Sedona", "Claude", "FastAPI", "React", "Leaflet", "geospatial", "risk-routing"],
  "status": "in-progress", "tier": 1,
  "link": "https://github.com/nishtobehonest/pipeline-risk-intelligence-agent",
  "description": "Spatial risk agent for natural gas pipelines — scores segments using FEMA flood zones, USGS seismic hazard, and Census urban proximity. When signals conflict (>0.40 spread), routes to human review with plain-English explanation. Never averages away ambiguity.",
  "proves": "The system knows when it shouldn't decide",
  "connects_to": ["decision-intelligence-agent", "site-intelligence-agent"]
}
```
Place as the **second entry** in nodes.json so it surfaces in the featured grid when flipped to `shipped`.

### 1c. Add 2d-world-ai
```json
{
  "slug": "2d-world-ai",
  "title": "2D World AI — Learning Lab",
  "type": "project", "domain": "ai-systems", "date": "2026-06",
  "tags": ["evals", "agents", "LLM", "learning-in-public", "deterministic"],
  "status": "in-progress", "tier": 2, "link": "",
  "description": "Chapter-by-chapter lab where AI concepts — deterministic agents, random agents, LLM navigation, evals, LLM-as-judge — are built into a 2D grid world. Each chapter ends with a notes.md written after running the code. The notes are the artifact.",
  "proves": "Learning AI engineering in public, with evals",
  "connects_to": ["learning-rag-architecture", "decision-intelligence-agent"]
}
```

### 1d. Add AI Lab bespoke pitch artifacts (4 nodes)
All `type: "project"`, `domain: "product"`, `tag: "FDE-artifact"`. Links blank until Vercel URLs confirmed.
```json
{ "slug": "artifact-waymo", "title": "Waymo — Map Readiness Brief", "proves": "Forward-deployed PM: builds before applying", "link": "" }
{ "slug": "artifact-homelight", "title": "HomeLight — Geospatial Intelligence Brief", "proves": "Forward-deployed PM: builds before applying", "link": "" }
{ "slug": "artifact-netic", "title": "Netic — Technician Intelligence Brief", "proves": "Forward-deployed PM: builds before applying", "link": "" }
{ "slug": "artifact-drafted", "title": "Drafted — Builder Retention Brief", "proves": "Forward-deployed PM: builds before applying", "link": "" }
```

---

## Phase 2 — Homepage Redesign (HIGH ROI, pure HTML)

### 2a. Replace generic path cards with philosophy-statement CTAs
| Statement | Links to | Signal |
|---|---|---|
| "When AI is wrong, it should say so." | `explore.html?slug=site-intelligence-agent` | Reliability thinking |
| "When AI isn't needed, I don't use it." | `explore.html?slug=decision-intelligence-agent` | Judgment |
| "I build before I apply." | `explore.html?domain=product` | FDE mentality |

The `.path-card` HTML structure stays unchanged — only label/title/description/link text changes. No JS or CSS changes.

### 2b. "Currently building" pulse strip
Add between hero and paths sections. Data-driven from `status: "in-progress"` nodes.

```html
<div class="building-strip">
  <span class="pulse-dot"></span>
  <span class="building-label">Currently building:</span>
  <div class="building-links"></div>  <!-- populated by main.js -->
</div>
```

CSS: `--teal` 8px circle + `@keyframes pulse`. 4 lines in `main.js` to filter in-progress nodes and render links.

### 2c. Surface persona routing on homepage
Add 3 persona pills below the hero:
```
[ For recruiters → ]  [ For engineers → ]  [ Just exploring → ]
```
Pure HTML links to `explore.html?persona=recruiter`, `?persona=engineer`, `?persona=all`. Surfaces the already-built persona routing without needing visitors to know the URL trick.

---

## Phase 3 — Rough.js Hand-Drawn Graph (VISUAL WOW)

Apply Rough.js to the D3 force graph so node borders and edges look excalidraw-sketched. Nish's visual language made literal.

**Implementation:**
1. CDN in `explore.html`: `<script src="https://cdn.jsdelivr.net/npm/roughjs@4/bundled/rough.min.js"></script>`
2. In `explorer.js`: Use `rough.svg(svgEl)` after simulation settles (`simulation.on('end', drawRough)`)
   - Nodes: `rc.circle(cx, cy, r*2, { roughness: 1.2, stroke: color, fill: 'none' })`
   - Edges: `rc.line(x1, y1, x2, y2, { roughness: 0.8, stroke: '#1E1E2E' })`
3. Run once on `simulation.on('end')` — not every tick (performance)

**Files:** `explore.html`, `js/explorer.js`

---

## Phase 4 — "Why I Built It This Way" Panel Callout (DEPTH SIGNAL)

Add optional `design_note` field to nodes.json. Renders as a left-border callout in the detail panel.

**Code changes:**
- `js/explorer.js`: Add `designNoteEl` in `openPanel()` after `provesEl`
- `css/style.css`: `.panel-design-note { border-left: 3px solid var(--blue); padding: 10px 14px; background: rgba(79,142,247,.06); margin-top: 16px; }`

**First 4 nodes to get `design_note`:**
- `site-intelligence-agent`: "Threshold tuning runs offline against a ground-truth eval set — tuning in production means the first bad answer has already shipped."
- `pipeline-risk-intelligence-agent`: "Three routing outcomes, not two. Binary alert/no-alert would average the conflict. The third path routes ambiguity to a human with an explanation of why."
- `decision-intelligence-agent`: "No LLM in the core decision path. The cost of acting is modeled explicitly — when revenue is healthy, suppressing low-priority actions is the right call."
- `calling-services-mcp`: "Email header injection blocked at input validation, not at send time. Security at the boundary, not in the middle."

---

## What's Deferred

- Timeline view (third graph mode) — high effort, low incremental signal
- Distinct `artifact` node type badge — tags achieve same discoverability for now
- `domain: geospatial` filter pill — tags handle this for now
- `journaling-app` / `SafeDrive` nodes — dilute signal for target audience

---

## Execution Order

1. `data/nodes.json` — Phase 1 (ground-truth, pipeline-risk, 2d-world-ai, 4 artifacts)
2. `index.html` — Phase 2a (philosophy CTAs) + 2c (persona pills)
3. `js/main.js` + `css/style.css` — Phase 2b (building strip)
4. `explore.html` + `js/explorer.js` + `css/style.css` — Phase 3 (Rough.js)
5. `js/explorer.js` + `css/style.css` — Phase 4 (design_note panel)
6. `data/nodes.json` — add `design_note` fields to 4 nodes

## Verification
- `nishchay.me` — philosophy CTAs, persona pills, building strip with in-progress projects
- `explore.html` grid — all new nodes visible, no broken graph edges
- `explore.html` graph — hand-drawn Rough.js aesthetic on nodes/edges
- Detail panel on `pipeline-risk-intelligence-agent` — `design_note` callout renders
- `?persona=recruiter` — filters + subtitle apply correctly
- Mobile 375px — persona pills and building strip don't break layout
