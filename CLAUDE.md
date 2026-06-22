# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal portfolio site for Nishchay Vishwanath — a "living knowledge graph" of projects, writing, and learning notes. Vanilla HTML/CSS/JS + D3.js, no build step.

**Strategic intent:** Dual-use — passive discovery (people find me) and active proof (sent during job applications). North star positioning: Agentic PM. Target audience: Series A/B startups bringing AI into physical-world/operational environments (drone analytics, geospatial, industrial ops, enterprise automation). The site shows trajectory, not just a snapshot — timestamps and statuses are intentionally visible.

## Running locally

```bash
python3 -m http.server 8080
npx serve .        # serves on http://localhost:3000
```

No build, no install step. The site is deployed to Vercel automatically on push to `main`.

## Architecture (v3 — rebuilt 2026-06-22)

The entire site is still driven by a single data file: [data/nodes.json](data/nodes.json). Nothing in the HTML needs to change to add content.

**Pages:**
- [index.html](index.html) — viewport-as-canvas landing page. No scroll. Two-column grid: identity left (38%), terminal typewriter right (62%). Navigation opens slide-in panels.
- [explore.html](explore.html) — full explorer with grid + D3 force-directed graph toggle; driven by [js/explorer.js](js/explorer.js). Linked from the PROJECTS panel.

**Key files:**
- `css/style.css` — design tokens + canvas layout + terminal + panel system + mobile
- `js/terminal.js` — typewriter animation; reads nodes.json, types project names + confidence gate lines
- `js/panel.js` — slide-in panel system; renders all 4 sections (WORK, PROJECTS, THINKING, ABOUT)
- `js/utils.js` — badge helpers shared between index and explore
- `data/nodes.json` — single source of truth for all content

**Homepage layout:**
```
┌──────────────────────┬──────────────────────────────────┐
│ Nishchay Vishwanath  │  > nishchay.me — knowledge graph │
│ Product → AI...      │  ──────────────────────────────  │
│                      │  site-intelligence-agent ... ✓   │
│ "What I cannot       │  pipeline-risk-agent ..... ↻     │
│  create, I do not    │  > confidence: 0.23 → human      │
│  understand."        │  > select a section. █           │
│ — R. Feynman         │                                  │
│                      │                                  │
│ 01 / WORK            │                                  │
│ 02 / PROJECTS        │                                  │
│ 03 / THINKING        │                                  │
│ 04 / ABOUT           │                                  │
│                      │                                  │
│ ↗ github ↗ linkedin  │                    ©2026         │
└──────────────────────┴──────────────────────────────────┘
```

**Panel system:**
- Clicking any nav item slides a panel in from the RIGHT — never navigates away from the canvas
- `Escape` or backdrop click closes the panel
- `01 / WORK` → accordion: Year / Company / Role ▼ (hardcoded in panel.js)
- `02 / PROJECTS` → card grid from nodes.json + filter pills + "View full graph →" link to explore.html
- `03 / THINKING` → list of blog + learning nodes from nodes.json
- `04 / ABOUT` → monospace bio, education, testimonials from nodes.json

**Mobile (≤768px):**
- Two columns collapse to vertical stack (identity top, terminal below)
- Panel takes full width
- Nav becomes 2×2 pill grid

## nodes.json schema

```json
{
  "slug": "unique-kebab-case-id",
  "title": "Display title",
  "type": "project | blog | learning | testimonial",
  "date": "YYYY-MM",
  "tags": ["tag1", "tag2"],
  "domain": "ai-systems | product | writing",
  "proves": "One-line signal this node demonstrates to a recruiter/PM.",
  "design_note": "Optional — non-obvious architectural decision. Renders as a callout in the detail panel.",
  "status": "shipped | in-progress | learning | coming-soon",
  "tier": 1,
  "link": "https://...",
  "description": "One sentence on what it is and what it demonstrated.",
  "connects_to": ["other-slug", "another-slug"]
}
```

- **tier 1** = shown first in PROJECTS panel, larger D3 node in explore.html
- `coming-soon` renders a dimmed card — intentional, shows growth arc
- `in-progress` renders an amber badge; appears in all persona views
- `testimonial` type renders in ABOUT panel as blockquote with amber left border
- `blog` nodes are external links; rendered in THINKING panel
- `domain` drives filter pills in PROJECTS panel and explore.html
- `proves` is surfaced as a one-line signal on project cards
- `design_note` is optional — renders as a callout in the explore.html detail panel

## Content loop — adding new nodes

When you ship or start something new:
1. Open `data/nodes.json`, copy the nearest analogous entry as a template
2. Set `status: "in-progress"` immediately — don't wait until it's done
3. Set `tier: 2` by default; only `tier: 1` if it's uniquely differentiating
4. Write `description` as one sentence: what it is + what it demonstrated
5. Write `proves` as one clause: what signal it sends to a recruiter or PM
6. Add at least one `connects_to` slug so it appears in the graph
7. Commit and push — Vercel auto-deploys in ~60 seconds

When something ships: flip `status` to `shipped`, add the `link`, consider adding a `design_note`.

## Design system

Dark theme (pure black), three fonts. CSS variables in [css/style.css](css/style.css):

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#0A0A0A` | Page background |
| `--surface` | `#111111` | Panel background |
| `--surface-2` | `#181818` | Cards inside panels |
| `--border` | `#222222` | Borders |
| `--border-2` | `#333333` | Subtle borders |
| `--text` | `#F0F0F0` | Primary text |
| `--muted` | `#666666` | Secondary text |
| `--muted-2` | `#999999` | Tertiary text |
| `--blue` | `#4F8EF7` | Projects, primary accent |
| `--purple` | `#A78BFA` | Blog/writing nodes |
| `--teal` | `#2DD4BF` | Learning nodes |
| `--amber` | `#F59E0B` | Testimonials, in-progress |
| `--green` | `#22C55E` | Shipped status |
| `--font-display` | Bricolage Grotesque | Name heading only |
| `--font-mono` | JetBrains Mono | Terminal, nav, tagline, labels |
| `--font-body` | Inter | Panel body text |
| `--panel-w` | `480px` | Slide-in panel width |

**Accent colors are functional, not decorative.** They map to node types and statuses — do not change them for aesthetic reasons.

## External libraries

- **D3 v7** — force-directed graph (`explore.html` only — NOT loaded on index.html)
- **Rough.js v4** — hand-drawn edge rendering on the D3 graph (`explore.html` only)

## Deployment

- **Live URL:** https://nishchay.me (`www.nishchay.me` redirects to apex)
- **GitHub:** https://github.com/nishtobehonest/nishtobehonest
- Deployed on Vercel, connected to the GitHub repo — every push to `main` auto-deploys
- [vercel.json](vercel.json) enables clean URLs (`/explore` instead of `/explore.html`)

## Planning history

- `planning/plan-01-knowledge-graph-portfolio.md` — original architecture
- `planning/plan-02-enrichment-and-visual.md` — enrichment pass
- `planning/plan-03-rebuild.md` — **current** — clean-slate canvas rebuild (2026-06-22)
