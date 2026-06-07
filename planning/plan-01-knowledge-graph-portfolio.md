# Knowledge Graph Portfolio — Build Plan

## Context

Nishchay needs a living portfolio site for active job applications (Agentic PM positioning) and passive discovery. Not a static resume — a growing, interconnected collection of proof showing how he thinks, what he's built, and how he's growing. Dual audience: hiring managers who have 45 seconds (landing layer) and interested people who want to explore (graph layer). Target: Series A/B startups bringing AI into physical-world/operational environments (drone analytics, geospatial, industrial ops, enterprise automation).

**Key decisions made:**
- Stack: Vanilla HTML/CSS/JS + D3.js (matches Applied-intuition design system)
- Data: `nodes.json` single source of truth in the repo
- Graph UX: Card grid by default, "View as Graph" toggle for D3 force-directed
- Repo/brand name: `nishtobehonest`
- Planning log: lives in `fd-os/planning/` (this file)

---

## File Structure

Build in `/Users/nish/Technical/nishtobehonest/` (new git repo):

```
nishtobehonest/
├── index.html           ← Landing page (sub-10-sec pitch)
├── explore.html         ← Explorer (grid default + graph toggle)
├── css/
│   └── style.css        ← Shared design system (ported from Applied-intuition)
├── js/
│   ├── main.js          ← Landing page scroll/animation
│   └── explorer.js      ← Grid filter logic + D3 graph toggle
├── data/
│   └── nodes.json       ← All content (add a JSON entry = add content)
└── vercel.json          ← Deploy config
```

---

## Design System (port from `/Users/nish/Technical/Applied-intuition-pitch/index.html`)

```css
--bg: #0A0A0F        /* page background */
--surface: #12121A   /* card background */
--border: #1E1E2E    /* card borders */
--text: #E2E8F0
--muted: #64748B
--blue: #4F8EF7      /* primary accent, projects */
--teal: #2DD4BF      /* learning nodes */
--green: #22C55E     /* shipped status */
--amber: #F59E0B     /* in-progress/learning status */
--purple: #A78BFA    /* blog/writing */
font: Inter, 400/500/600/700
max-width: 1100px, border-radius: 12px cards / 8px elements
```

---

## nodes.json Schema

```json
{
  "slug": "magma",
  "title": "MAGMA — Agentic Memory Architecture",
  "type": "project | blog | learning | testimonial",
  "date": "2026-03",
  "tags": ["memory", "graphs", "agentic"],
  "status": "shipped | in-progress | learning | coming-soon",
  "tier": 1,
  "link": "https://...",
  "description": "One-liner on what it is and what it showed.",
  "connects_to": ["site-intelligence-agent", "calling-services-mcp"]
}
```

**Type notes:**
- `social` is NOT a node type — socials (GitHub, LinkedIn, email) live only in the footer.
- `blog` nodes are external links (LinkedIn articles, Substack) for now — no hosted pages.
- `testimonial` nodes use a different card layout (quote + person + company).
- `coming-soon` status makes future content visible as placeholders, showing growth arc.

**Seed content from `/Users/nish/Technical/PORTFOLIO.md`:**
- Tier 1 (5): site-intelligence-agent, MAGMA, CallingServices_MCP, decision-intelligence-agent, email-negotiation-coach
- Tier 2 (5): Case Studies, DTI-ServiceNow, latex-resume-tailor-mcp, agent-pm-1, agentic-consulting-analyst
- Blog/testimonial stubs: `status: coming-soon`, visible but not linked yet

**connects_to edge handling:** Edges in D3 are undirected. If A lists B, one edge renders regardless of whether B also lists A. Deduplicated before rendering.

---

## Phase 1 — Landing Page (`index.html`)

**Hero copy (draft — adjust before shipping):**
- Eyebrow: `AGENTIC PM`
- Headline: `"I build AI systems that fail gracefully."`
- Sub-line: `RAG pipelines, MCP servers, memory architectures, decision engines — for environments where wrong answers cost something. Cornell MEM, May 2026.`

**Sections:**
1. Nav — name left, "Explore →" right
2. Hero — eyebrow + headline + sub-line + scroll hint
3. Three paths — "What I've shipped" → explore.html | "How I think" → explore.html?type=blog,learning | "Get in touch" → mailto + LinkedIn
4. Featured work — 3 Tier 1 nodes from nodes.json dynamically
5. Footer — GitHub · LinkedIn · email · "View all work →"

**SEO:** JSON-LD Person schema + og:title/description/image. Only index.html is fully crawlable.

---

## Phase 2 — Explorer Page (`explore.html`)

### Grid view (default)
- Filter pills: type (All/Project/Blog/Learning/Testimonial) + status (All/Shipped/In Progress/Learning)
- URL query params pre-select filters on load (`?type=blog,learning`)
- 3-col → 2-col → 1-col responsive grid
- `coming-soon` cards: dimmed, lock icon, no link
- Click card → slide-out detail panel (380px)

### Graph view (toggle)
- `[≡ Grid] [◉ Graph]` toggle, crossfade 300ms
- Filter state persists across toggle
- D3 v7 via CDN, force-directed simulation
- Nodes: colored by type, sized by tier
- Edges: undirected, deduplicated, low-opacity; highlight on hover
- Loading spinner during 800ms warm-up
- Graph toggle hidden on mobile (< 768px)

### Detail panel
- Slides in from right (desktop), full-screen (mobile)
- Close: X button + Escape + click-outside
- Fields: title, badges, date, description, tags, link button (hidden if coming-soon)
- "Connected to" mini-cards — click to open connected node
- Testimonial layout: large quote + person/company, not standard card

---

## Phase 3 — Data Population

- Tier 1+2 nodes from PORTFOLIO.md with accurate connects_to links
- `coming-soon` stubs for 2-3 planned blog posts and testimonials
- No social nodes — footer only

---

## Phase 4 — Polish

- Left-rail dot scroll progress on landing page only
- vercel.json for clean URLs (no .html)
- og: meta tags for share previews

---

## Verification

1. Hero reads in under 10 seconds, three paths have distinct targets
2. "How I think" CTA → explore.html?type=blog,learning pre-applies filter
3. Grid loads all nodes from JSON (no hardcoded HTML)
4. Graph: spinner → D3 renders, type colors correct, Tier 1 nodes larger
5. Filter in grid mode, toggle graph → filter persists
6. Click node → detail panel; Escape closes it
7. Testimonial node → quote layout in panel
8. Add JSON entry → appears everywhere without touching HTML
9. Mobile 375px → grid works, graph toggle absent
10. Vercel deploy → og:title preview works in Slack/iMessage
