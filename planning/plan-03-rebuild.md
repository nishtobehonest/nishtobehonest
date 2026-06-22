# Plan 03 — Clean-Slate Portfolio Rebuild

**Decision date:** 2026-06-22  
**Status:** Approved, ready to build

## Why we're rebuilding

After analyzing siddharthb.xyz and lutzfinger.com, the verdict was that the current site's architecture is right (data-driven, nodes.json, D3 graph) but its layout is a conventional scrolling document that undersells the content. The new design is a **viewport-as-canvas** single page — no scroll on the homepage, a terminal typewriter as the centerpiece interactive, and a slide-in panel system for all navigation.

## Design decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Interactive center | Terminal typewriter | Most on-brand for a builder-PM; shows you work at the system level |
| Hero quote | "What I cannot create, I do not understand." — R. Feynman | 7 words, maps to "build before you apply", not a VC quote |
| Name position | Top-LEFT | Siddharth is top-right — flipping this changes the whole composition |
| Navigation | Numbered `01 / WORK`, `02 / PROJECTS`, `03 / THINKING`, `04 / ABOUT` | Numbered nav is a visual signature, not just style |
| Navigation pattern | Slide-in panels from RIGHT | Never leave the canvas; panel system already proven in explorer.js |
| Color | Pure black `#0A0A0A` + functional accents only | Accents map to node types (blue/teal/green/amber/purple) — keep them |
| Photo | Removed from hero | The terminal IS the interactive; no photo needed on homepage |

## Layout

```
┌──────────────────────────────────────────────────────────┐  ← 100vh, no scroll
│                                                          │
│  Nishchay Vishwanath              [                    ] │
│  Product → AI. Systems.           [  TERMINAL          ] │
│  Geospatial.                      [  TYPEWRITER        ] │
│                                   [                    ] │
│  "What I cannot create,           [  > loading 18       ] │
│   I do not understand."           [    projects...      ] │
│   — R. Feynman                    [  site-intelligence  ] │
│                                   [    ........ ✓       ] │
│  01 / WORK                        [  confidence: 0.23   ] │
│  02 / PROJECTS                    [    → human review   ] │
│  03 / THINKING                    [                    ] │
│  04 / ABOUT                       [  > select a section ] │
│                                   [    to explore. █    ] │
│  ↗ github  ↗ linkedin  ↗ email         ©2026 nishchay.me│
└──────────────────────────────────────────────────────────┘
```

CSS Grid: `grid-template-columns: 38fr 62fr; height: 100vh; overflow: hidden`

## Files

### New (full rebuild):
- `index.html` — canvas layout
- `css/style.css` — rebuilt from scratch, same CSS token names
- `js/terminal.js` — typewriter animation, reads from nodes.json
- `js/panel.js` — slide-in panel + 4 section renderers

### Unchanged:
- `data/nodes.json`
- `js/utils.js` (typeBadgeClass, statusBadgeClass, statusLabel helpers)
- `vercel.json`

### Left alone until Phase 2 redesign:
- `explore.html` — linked from PROJECTS panel as "View full graph →"
- `js/explorer.js`
- `js/main.js` — no longer used by new index.html

## Terminal sequence

```
> nishchay.me — knowledge graph
──────────────────────────────

AGENTIC PM  ·  CORNELL MEM  ·  2026

> scanning 18 projects...

site-intelligence-agent .............. shipped ✓
pipeline-risk-intelligence-agent ..... building ↻
MAGMA — agentic memory ............... shipped ✓
CallingServices MCP .................. shipped ✓
decision-intelligence-agent .......... shipped ✓
[+13 more]

> confidence gate: 0.23 → human review
> confidence gate: 0.87 → proceed
> confidence gate: 0.41 → ambiguous → human review

> 18 projects  ·  2 in progress  ·  2 learning

> select a section to explore. █
```

## Panel content

| Nav item | Panel renders |
|---|---|
| 01 / WORK | Accordion: `Year / Company / Role ▼` with bullet expansion |
| 02 / PROJECTS | 2-col card grid + filter pills (All/Shipped/In Progress/Domain) + "View full graph →" |
| 03 / THINKING | List of blog + learning nodes |
| 04 / ABOUT | Monospace bio, Education with slash separators, Testimonials |

## Fonts (Google Fonts, combined link)

- Bricolage Grotesque — display/name (weight 800)
- JetBrains Mono — all metadata, terminal, nav, tagline, quote, social
- Inter — panel body text

## Build order

1. `css/style.css` — tokens → canvas layout → terminal → panel → nav → mobile
2. `index.html` — canvas HTML skeleton
3. `js/terminal.js` — typewriter with real nodes data
4. `js/panel.js` — open/close + all 4 section renderers
5. Test in browser
6. Update `explore.html` Google Fonts link only

## What NOT to do

- Don't add any more sections to the homepage (no scroll)
- Don't bring the D3 graph to index.html (that's explore.html's job)
- Don't use any CSS frameworks, build tools, or JS frameworks
- Don't change nodes.json schema
- Don't redesign explore.html in this pass
