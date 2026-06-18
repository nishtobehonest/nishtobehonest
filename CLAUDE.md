# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal portfolio site for Nishchay Vishwanath — a "living knowledge graph" of projects, writing, and learning notes. Vanilla HTML/CSS/JS + D3.js, no build step.

**Strategic intent:** Dual-use — passive discovery (people find me) and active proof (sent during job applications). North star positioning: Agentic PM. Target audience: Series A/B startups bringing AI into physical-world/operational environments (drone analytics, geospatial, industrial ops, enterprise automation). The site shows trajectory, not just a snapshot — timestamps and statuses are intentionally visible.

## Running locally

Open any HTML file directly in a browser, or serve with any static server:

```bash
npx serve .        # serves on http://localhost:3000
python3 -m http.server 8080
```

No build, no install step. The site is deployed to Vercel automatically on push to `main`.

## Architecture

The entire site is driven by a single data file: [data/nodes.json](data/nodes.json). Adding a JSON entry is all it takes to add content — nothing in the HTML needs to change.

**Pages:**
- [index.html](index.html) — landing page; loads `data/nodes.json` and renders the 3 featured Tier-1 project nodes via [js/main.js](js/main.js)
- [explore.html](explore.html) — full explorer with grid + D3 force-directed graph toggle; driven by [js/explorer.js](js/explorer.js)

**Key flows:**
- `?type=blog,learning` URL param pre-selects the type filter on `explore.html`
- `?persona=recruiter|engineer|all` URL param activates a persona preset (defined in `PERSONAS` in `explorer.js`), which sets type/status/domain filters in one shot; manually changing any filter clears the active persona
- Grid and graph views share the same filter state — switching view preserves filters
- Clicking any node card opens a slide-out detail panel from the right; `Escape` or backdrop click closes it
- Detail panel includes a "Connected to" section with clickable mini-cards that open the linked node
- Graph edges are undirected and deduplicated before D3 renders them
- Graph toggle (`.view-toggle`) is hidden at ≤900px (mobile/tablet)

**SEO:** `index.html` has JSON-LD Person schema and `og:title`/`og:description` meta tags for share previews. Only `index.html` is fully crawlable.

## nodes.json schema

```json
{
  "slug": "unique-kebab-case-id",
  "title": "Display title",
  "type": "project | blog | learning | testimonial",
  "date": "YYYY-MM",
  "tags": ["tag1", "tag2"],
  "domain": "ai-systems | product",
  "proves": "One-line signal this node demonstrates to a recruiter/PM.",
  "status": "shipped | in-progress | learning | coming-soon",
  "tier": 1,
  "link": "https://...",
  "description": "One sentence on what it is and what it demonstrated.",
  "connects_to": ["other-slug", "another-slug"]
}
```

- **tier 1** = featured on landing page, larger D3 node; **tier 2** = explorer only
- `coming-soon` status renders a dimmed card with lock icon and no link — intentional, to show growth arc
- `testimonial` type uses a quote blockquote layout in the detail panel, not the standard card layout
- `blog` nodes are external links (LinkedIn articles, Substack) — no hosted pages
- `domain` drives the domain filter pill on the explorer; current values: `ai-systems`, `product`
- `proves` is surfaced in the grid card as a one-line signal (e.g. "Designs for failure, not the happy path")
- Edges in `connects_to` are one-directional in the data but rendered as undirected in D3 (deduped by sorted slug pair)
- Social links (GitHub, LinkedIn, email) are footer-only — not node types

## Design system

Dark theme, Inter font. CSS variables in [css/style.css](css/style.css):

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#0A0A0F` | Page background |
| `--surface` | `#12121A` | Cards |
| `--border` | `#1E1E2E` | Card borders |
| `--text` | `#E2E8F0` | Body text |
| `--muted` | `#64748B` | Secondary text |
| `--muted-2` | `#94A3B8` | Tertiary text |
| `--blue` | `#4F8EF7` | Projects, primary accent |
| `--purple` | `#A78BFA` | Blog/writing nodes |
| `--teal` | `#2DD4BF` | Learning nodes |
| `--amber` | `#F59E0B` | Testimonials, in-progress status |
| `--green` | `#22C55E` | Shipped status |

Badge helper functions (`typeBadgeClass`, `statusBadgeClass`, `statusLabel`) live in [js/utils.js](js/utils.js) and are loaded by both pages before their own scripts.

## Deployment

Deployed on Vercel. [vercel.json](vercel.json) enables clean URLs (`/explore` instead of `/explore.html`). The `main` branch is production.
