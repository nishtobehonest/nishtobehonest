# Portfolio Website - Brainstorm Context

## What I'm Building

A living knowledge graph portfolio website for branding and job applications. Not a static resume site — a growing, interconnected collection of proof that shows how I think, what I've built, and how I'm growing.

**Dual use:**
- Passive discovery (people find me)
- Active proof (send the link during job applications)

---

## Positioning

**North star:** Agentic PM (most differentiated, frontier-specific)
**Supporting:** AI PM as the domain, Forward Deployed PM as how I like to work (close to customers and engineering)

**Avoid:** listing all three as equal headlines — dilutes the signal.

---

## What I Have Right Now

- Artifacts (Claude artifacts / interactive builds)
- Side projects

**Coming later:** blog posts, testimonials, learning notes, socials, community links

---

## Core Design Decisions

### Two-layer structure

1. **Landing layer** — fast-reading, sub-10-second pitch. One positioning line, one proof hook, three clear paths (shipped work, how I think, social proof). For hiring managers with 45 seconds.
2. **Knowledge graph layer** — the "explore deeper" experience for people already interested. Interconnected nodes across artifacts, posts, skills, learning, testimonials.

### Living architecture

Data and design are separate from day one. One config file (or Notion database) drives the whole site. Adding new content = adding one entry, never rebuilding HTML/CSS.

**Node schema (designed to grow):**
```
title:        string
type:         artifact | project | blog | testimonial | learning | social
date:         YYYY-MM
tags:         [skills, concepts]
status:       learning | in-progress | shipped
link:         URL
description:  one-liner on what it is and what it showed me
connects_to:  [other node slugs]
```

### Growth arc as proof

Timestamps and statuses are visible. The portfolio shows trajectory, not just snapshot. For an Agentic PM, demonstrating how you think and grow is the signal — not just listing outputs.

---

## What's Kept Separate

**Portfolio** (this site) — hire me, here's my proof, here's how I think
**Learner's guide** — a separate cluster within the knowledge graph, not the main pitch. Different audience intent. Can share nodes with the portfolio layer but shouldn't be conflated with it.

---

## Communication Growth Angle

Representing improvement over time via:
- Timestamped blog posts (arc is visible)
- A dedicated post about the PM communication journey (meta-proof)
- Before/after artifacts where applicable

---

## Open Questions / Next Steps

- [ ] Inventory existing artifacts and side projects (title, link, one-liner, tags)
- [ ] Decide on data layer: flat JSON config vs. Notion database as backend
- [ ] Decide on hosting: GitHub Pages, Vercel, or other
- [ ] Draft the positioning headline (one line)
- [ ] Design the knowledge graph visual (D3, Cytoscape, or simpler tag-based filtering)
- [ ] Build MVP with artifacts + projects only, schema ready for growth
