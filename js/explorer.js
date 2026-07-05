/* Explorer: grid + graph toggle, filter state, detail panel */

const NODES_URL = 'data/nodes.json';

/* ── Type → color map ────────────────────────────── */
const TYPE_COLOR = {
  project:     '#4F8EF7',
  blog:        '#A78BFA',
  learning:    '#2DD4BF',
  testimonial: '#F59E0B',
};

/* ── Persona presets ─────────────────────────────── */
const PERSONAS = {
  recruiter: {
    subtitle: 'Curated for hiring — all work including what\'s in progress.',
    filters:  { type: 'all', status: 'all', domain: 'all' },
    sort: (a, b) => (a.tier || 2) - (b.tier || 2) || (new Date(b.date) - new Date(a.date)),
  },
  engineer: {
    subtitle: 'The technical work — systems, protocols, and architecture decisions.',
    filters:  { type: 'all', status: 'all', domain: 'ai-systems' },
    sort: (a, b) => new Date(b.date) - new Date(a.date),
  },
  curious: {
    subtitle: 'Everything I\'ve built, written, and learned — interconnected.',
    filters:  { type: 'all', status: 'all', domain: 'all' },
    sort: null,
  },
};

const DEFAULT_SUBTITLE = 'Projects / Writing / Learning — interconnected.';

/* ── State ───────────────────────────────────────── */
let allNodes = [];
let activeTypeFilter   = 'all';
let activeStatusFilter = 'all';
let activeDomain       = 'all';
let activePersona      = null;
let currentView = 'grid';
let graphBuilt = false;
let simulation = null;
let roughLinkGroup = null;

/* ── Filter helpers ──────────────────────────────── */
function getVisibleNodes() {
  let nodes = allNodes.filter(n => {
    const typeOk   = activeTypeFilter   === 'all' || n.type   === activeTypeFilter;
    const statusOk = activeStatusFilter === 'all' || n.status === activeStatusFilter;
    const domainOk = activeDomain === 'all' || n.domain === activeDomain;
    return typeOk && statusOk && domainOk;
  });

  if (activePersona && PERSONAS[activePersona].sort) {
    nodes = [...nodes].sort(PERSONAS[activePersona].sort);
  }

  return nodes;
}

/* ── URL query param → initial filter state ─────── */
function applyURLFilters() {
  const params = new URLSearchParams(window.location.search);

  const personaParam = params.get('persona');
  if (personaParam && PERSONAS[personaParam]) {
    activePersona = personaParam;
    const preset = PERSONAS[personaParam].filters;
    activeTypeFilter   = preset.type;
    activeStatusFilter = preset.status;
    activeDomain       = preset.domain;
  }

  const typeParam = params.get('type');
  if (typeParam) {
    const first = typeParam.split(',')[0].trim();
    if (['project','blog','learning','testimonial'].includes(first)) {
      activeTypeFilter = first;
      activePersona = null;
    }
  }

  const domainParam = params.get('domain');
  if (domainParam && ['ai-systems','product','writing'].includes(domainParam)) {
    activeDomain  = domainParam;
    activePersona = null;
  }
}

/* ── Grid rendering ──────────────────────────────── */
function renderGrid() {
  const grid = document.getElementById('nodesGrid');
  const visible = getVisibleNodes();

  grid.innerHTML = visible.map(node => {
    const isSoon = node.status === 'coming-soon';
    const linkEl = (!isSoon && node.link)
      ? `<a href="${node.link}" class="node-link" target="_blank" rel="noopener" onclick="event.stopPropagation()">View →</a>`
      : (isSoon ? `<span class="lock-icon">🔒 Coming soon</span>` : '');

    const provesEl = node.proves
      ? `<p class="node-proves">→ ${node.proves}</p>`
      : '';

    return `
      <div class="node-card ${isSoon ? 'coming-soon' : ''}" data-slug="${node.slug}">
        <div class="node-card-top">
          <div class="node-card-badges">
            <span class="badge ${typeBadgeClass(node.type)}">${node.type}</span>
            ${node.type !== 'testimonial' ? `<span class="badge ${statusBadgeClass(node.status)}">${statusLabel(node.status)}</span>` : ''}
          </div>
          <span class="node-date">${node.date}</span>
        </div>
        <h3 class="node-title">${node.title}</h3>
        <p class="node-desc">${node.description}</p>
        ${provesEl}
        <div class="node-tags">${node.tags.slice(0, 5).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        ${linkEl}
      </div>`;
  }).join('');

  grid.querySelectorAll('.node-card').forEach(card => {
    card.addEventListener('click', () => {
      const node = allNodes.find(n => n.slug === card.dataset.slug);
      if (node) openPanel(node);
    });
  });
}

/* ── Sync filter pill active states ─────────────── */
function syncFilterPills() {
  document.querySelectorAll('[data-filter-type="type"]').forEach(p =>
    p.classList.toggle('active', p.dataset.value === activeTypeFilter));
  document.querySelectorAll('[data-filter-type="status"]').forEach(p =>
    p.classList.toggle('active', p.dataset.value === activeStatusFilter));
  document.querySelectorAll('[data-filter-type="domain"]').forEach(p =>
    p.classList.toggle('active', p.dataset.value === activeDomain));
}

/* ── Persona selector ────────────────────────────── */
function initPersonaSelector() {
  document.querySelectorAll('.persona-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const persona = pill.dataset.persona;

      if (activePersona === persona) {
        // Toggle off — return to defaults
        activePersona      = null;
        activeTypeFilter   = 'all';
        activeStatusFilter = 'all';
        activeDomain       = 'all';
      } else {
        activePersona = persona;
        const preset = PERSONAS[persona].filters;
        activeTypeFilter   = preset.type;
        activeStatusFilter = preset.status;
        activeDomain       = preset.domain;
      }

      document.querySelectorAll('.persona-pill').forEach(p =>
        p.classList.toggle('active', p.dataset.persona === activePersona));

      const subtitle = document.getElementById('explorerSubtitle');
      if (subtitle) {
        subtitle.textContent = activePersona
          ? PERSONAS[activePersona].subtitle
          : DEFAULT_SUBTITLE;
      }

      syncFilterPills();
      renderGrid();

      if (currentView === 'graph') { graphBuilt = false; buildGraph(); }
    });
  });
}

/* ── Filter pills ────────────────────────────────── */
function initFilters() {
  document.querySelectorAll('[data-filter-type]').forEach(pill => {
    pill.addEventListener('click', () => {
      const filterType = pill.dataset.filterType;
      const value = pill.dataset.value;

      if (filterType === 'type')        activeTypeFilter   = value;
      else if (filterType === 'status') activeStatusFilter = value;
      else if (filterType === 'domain') activeDomain       = value;

      // Clear persona when user manually changes any filter
      activePersona = null;
      document.querySelectorAll('.persona-pill').forEach(p => p.classList.remove('active'));
      const subtitle = document.getElementById('explorerSubtitle');
      if (subtitle) subtitle.textContent = DEFAULT_SUBTITLE;

      syncFilterPills();
      renderGrid();

      if (currentView === 'graph') { graphBuilt = false; buildGraph(); }
    });
  });

  syncFilterPills();
}

/* ── View toggle ─────────────────────────────────── */
function initViewToggle() {
  const gridBtn  = document.getElementById('gridBtn');
  const graphBtn = document.getElementById('graphBtn');
  const grid     = document.getElementById('nodesGrid');
  const graphCon = document.getElementById('graphContainer');

  gridBtn.addEventListener('click', () => {
    if (currentView === 'grid') return;
    currentView = 'grid';
    gridBtn.classList.add('active');
    graphBtn.classList.remove('active');
    grid.style.display = '';
    graphCon.classList.remove('active');
  });

  graphBtn.addEventListener('click', () => {
    if (currentView === 'graph') return;
    currentView = 'graph';
    graphBtn.classList.add('active');
    gridBtn.classList.remove('active');
    grid.style.display = 'none';
    graphCon.classList.add('active');
    if (!graphBuilt) buildGraph();
  });
}

/* ── D3 force-directed graph ─────────────────────── */
function buildGraph() {
  graphBuilt = true;
  const spinner = document.getElementById('graphSpinner');
  spinner.classList.remove('hidden');

  const visible = getVisibleNodes();
  const visibleSlugs = new Set(visible.map(n => n.slug));

  const edgePairs = new Set();
  const links = [];
  visible.forEach(node => {
    (node.connects_to || []).forEach(target => {
      if (!visibleSlugs.has(target)) return;
      const key = [node.slug, target].sort().join('||');
      if (!edgePairs.has(key)) {
        edgePairs.add(key);
        links.push({ source: node.slug, target });
      }
    });
  });

  const nodes = visible.map(n => ({
    id:     n.slug,
    title:  n.title,
    type:   n.type,
    status: n.status,
    tier:   n.tier || 2,
    node:   n,
  }));

  const svgEl = document.getElementById('graph-svg');
  const container = document.getElementById('graphContainer');
  const W = container.clientWidth;
  const H = container.clientHeight;

  // Edge/label colors must track the active theme — hardcoded white was
  // invisible against the light theme's off-white background.
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVar = name => rootStyle.getPropertyValue(name).trim();
  const typeColor = {
    project:     cssVar('--blue')   || TYPE_COLOR.project,
    blog:        cssVar('--purple') || TYPE_COLOR.blog,
    learning:    cssVar('--teal')   || TYPE_COLOR.learning,
    testimonial: cssVar('--amber')  || TYPE_COLOR.testimonial,
  };
  const edgeColor      = cssVar('--border-2') || 'rgba(255,255,255,.12)';
  const edgeColorHover = cssVar('--muted-2')  || 'rgba(255,255,255,.6)';
  const labelColor     = cssVar('--muted-2')  || 'rgba(226,232,240,.75)';

  d3.select(svgEl).selectAll('*').remove();
  if (simulation) simulation.stop();

  const svg = d3.select(svgEl)
    .attr('width', W)
    .attr('height', H);

  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

  const nodeRadius = d => d.tier === 1 ? 16 : 11;

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-280))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 14));

  const linkGroup = g.append('g');
  const link = linkGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', edgeColor)
    .attr('stroke-width', 1.5);

  // Rough.js: draw hand-sketched edges once simulation settles
  roughLinkGroup = null;
  function drawRoughEdges() {
    if (roughLinkGroup) { roughLinkGroup.remove(); roughLinkGroup = null; }
    if (typeof rough === 'undefined') return;
    const rc = rough.svg(svgEl);
    const rg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rg.setAttribute('pointer-events', 'none');
    links.forEach((l, idx) => {
      if (l.source.x == null) return;
      const el = rc.line(l.source.x, l.source.y, l.target.x, l.target.y, {
        roughness: 1.3, stroke: edgeColor, strokeWidth: 1.5, seed: (idx + 1) * 17,
      });
      rg.appendChild(el);
    });
    roughLinkGroup = rg;
    g.node().insertBefore(rg, linkGroup.node());
    linkGroup.attr('opacity', 0);
  }
  simulation.on('end.rough', drawRoughEdges);

  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => {
        if (!e.active) simulation.alphaTarget(0.3).restart();
        if (roughLinkGroup) { roughLinkGroup.remove(); roughLinkGroup = null; linkGroup.attr('opacity', 1); }
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.append('circle')
    .attr('r', nodeRadius)
    .attr('fill', d => typeColor[d.type] || typeColor.project)
    .attr('fill-opacity', d => d.status === 'coming-soon' ? 0.35 : 0.9)
    .attr('stroke', d => typeColor[d.type] || typeColor.project)
    .attr('stroke-width', d => d.tier === 1 ? 2.5 : 1.5)
    .attr('stroke-opacity', 0.6);

  node.append('text')
    .text(d => d.title.length > 22 ? d.title.slice(0, 20) + '…' : d.title)
    .attr('text-anchor', 'middle')
    .attr('dy', d => nodeRadius(d) + 14)
    .attr('fill', labelColor)
    .attr('font-size', '10px')
    .attr('font-family', 'Inter, sans-serif')
    .attr('pointer-events', 'none');

  const tooltip = document.getElementById('graphTooltip');
  const tooltipTitle = document.getElementById('tooltipTitle');
  const tooltipType  = document.getElementById('tooltipType');

  node
    .on('mouseover', (e, d) => {
      tooltip.classList.add('visible');
      tooltipTitle.textContent = d.title;
      tooltipType.textContent  = d.type;
      tooltipType.style.color  = typeColor[d.type] || typeColor.project;
      const isConnected = l => l.source.id === d.id || l.target.id === d.id;
      link
        .attr('stroke', edgeColorHover)
        .attr('stroke-opacity', l => isConnected(l) ? 1 : 0.3)
        .attr('stroke-width', l => isConnected(l) ? 2.5 : 1.5)
        .attr('opacity', 1);
    })
    .on('mousemove', e => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top  = (e.clientY - rect.top  - 8) + 'px';
    })
    .on('mouseout', () => {
      tooltip.classList.remove('visible');
      link
        .attr('stroke', edgeColor)
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
        .attr('opacity', roughLinkGroup ? 0 : 1);
    })
    .on('click', (e, d) => {
      e.stopPropagation();
      openPanel(d.node);
    });

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  setTimeout(() => spinner.classList.add('hidden'), 900);
}

/* ── Detail panel ────────────────────────────────── */
function openPanel(node) {
  const panel    = document.getElementById('detailPanel');
  const backdrop = document.getElementById('panelBackdrop');
  const badges   = document.getElementById('panelBadges');
  const body     = document.getElementById('panelBody');

  badges.innerHTML = `
    <span class="badge ${typeBadgeClass(node.type)}">${node.type}</span>
    <span class="badge ${statusBadgeClass(node.status)}">${statusLabel(node.status)}</span>
  `;

  const isSoon = node.status === 'coming-soon';

  if (node.type === 'testimonial') {
    body.innerHTML = `
      <h2 class="panel-title">${node.title}</h2>
      <p class="panel-meta">${node.author_title || ''}</p>
      <blockquote class="panel-quote">"${node.description}"</blockquote>
      ${node.link ? `<a href="${node.link}" class="panel-action" target="_blank" rel="noopener">View on LinkedIn →</a>` : ''}
      ${connectedSection(node)}
    `;
  } else {
    const actionBtn = (!isSoon && node.link)
      ? `<a href="${node.link}" class="panel-action" target="_blank" rel="noopener">View ${node.type === 'blog' ? 'post' : 'project'} →</a>`
      : '';

    const provesEl = node.proves
      ? `<p class="panel-proves">→ ${node.proves}</p>`
      : '';

    const designNoteEl = node.design_note
      ? `<div class="panel-design-note">
           <p class="panel-design-note-label">Why I built it this way</p>
           <p>${node.design_note}</p>
         </div>`
      : '';

    body.innerHTML = `
      <h2 class="panel-title">${node.title}</h2>
      <p class="panel-meta">${node.date}${node.tier ? ` · Tier ${node.tier}` : ''}</p>
      <p class="panel-desc">${node.description}</p>
      ${provesEl}
      ${designNoteEl}
      <div class="panel-tags">${node.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${actionBtn}
      ${connectedSection(node)}
    `;
  }

  panel.classList.add('open');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  body.querySelectorAll('.connected-node-card').forEach(card => {
    card.addEventListener('click', () => {
      const n = allNodes.find(x => x.slug === card.dataset.slug);
      if (n) openPanel(n);
    });
  });
}

function connectedSection(node) {
  const connected = (node.connects_to || [])
    .map(slug => allNodes.find(n => n.slug === slug))
    .filter(Boolean);

  if (!connected.length) return '';

  const cards = connected.map(n => `
    <div class="connected-node-card" data-slug="${n.slug}">
      <div>
        <span class="connected-node-title">${n.title}</span>
        <span class="badge ${typeBadgeClass(n.type)}" style="margin-left:8px;font-size:.6rem;">${n.type}</span>
      </div>
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  `).join('');

  return `
    <div>
      <p class="panel-section-label">Connected to</p>
      <div class="connected-nodes">${cards}</div>
    </div>
  `;
}

function closePanel() {
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('panelBackdrop').classList.remove('active');
  document.body.style.overflow = '';
}

/* ── Init ────────────────────────────────────────── */
async function init() {
  const res = await fetch(NODES_URL);
  allNodes = await res.json();

  applyURLFilters();
  initPersonaSelector();
  initFilters();

  // Sync persona pill highlight + subtitle if set from URL
  if (activePersona) {
    document.querySelectorAll('.persona-pill').forEach(p =>
      p.classList.toggle('active', p.dataset.persona === activePersona));
    const subtitle = document.getElementById('explorerSubtitle');
    if (subtitle) subtitle.textContent = PERSONAS[activePersona].subtitle;
  }

  renderGrid();
  initViewToggle();

  document.getElementById('panelClose').addEventListener('click', closePanel);
  document.getElementById('panelBackdrop').addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  // Graph colors are read from CSS vars at build time — rebuild on theme
  // toggle so edges/nodes don't keep the other theme's colors.
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentView === 'graph') { graphBuilt = false; buildGraph(); }
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
