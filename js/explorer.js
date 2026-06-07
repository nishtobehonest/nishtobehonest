/* Explorer: grid + graph toggle, filter state, detail panel */

const NODES_URL = 'data/nodes.json';

/* ── Type → color map ────────────────────────────── */
const TYPE_COLOR = {
  project:     '#4F8EF7',
  blog:        '#A78BFA',
  learning:    '#2DD4BF',
  testimonial: '#F59E0B',
};

/* ── Badge helpers (shared with main.js pattern) ─── */
function typeBadgeClass(type) {
  return { project:'badge-project', blog:'badge-blog', learning:'badge-learning', testimonial:'badge-testimonial' }[type] || 'badge-project';
}
function statusBadgeClass(s) {
  return { shipped:'badge-shipped', 'in-progress':'badge-in-progress', learning:'badge-learning-st', 'coming-soon':'badge-coming-soon' }[s] || 'badge-coming-soon';
}
function statusLabel(s) {
  return { shipped:'Shipped', 'in-progress':'In progress', learning:'Learning', 'coming-soon':'Coming soon' }[s] || s;
}

/* ── State ───────────────────────────────────────── */
let allNodes = [];
let activeTypeFilter  = 'all';
let activeStatusFilter = 'all';
let currentView = 'grid'; // 'grid' | 'graph'
let graphBuilt = false;
let simulation = null;

/* ── Filter helpers ──────────────────────────────── */
function getVisibleNodes() {
  return allNodes.filter(n => {
    const typeOk   = activeTypeFilter  === 'all' || n.type   === activeTypeFilter;
    const statusOk = activeStatusFilter === 'all' || n.status === activeStatusFilter;
    return typeOk && statusOk;
  });
}

/* ── URL query param → initial filter state ─────── */
function applyURLFilters() {
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type');
  if (typeParam) {
    const first = typeParam.split(',')[0].trim();
    if (['project','blog','learning','testimonial'].includes(first)) {
      activeTypeFilter = first;
    }
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

    return `
      <div class="node-card ${isSoon ? 'coming-soon' : ''}" data-slug="${node.slug}">
        <div class="node-card-top">
          <div class="node-card-badges">
            <span class="badge ${typeBadgeClass(node.type)}">${node.type}</span>
            <span class="badge ${statusBadgeClass(node.status)}">${statusLabel(node.status)}</span>
          </div>
          <span class="node-date">${node.date}</span>
        </div>
        <h3 class="node-title">${node.title}</h3>
        <p class="node-desc">${node.description}</p>
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

/* ── Filter pills ────────────────────────────────── */
function initFilters() {
  document.querySelectorAll('[data-filter-type]').forEach(pill => {
    pill.addEventListener('click', () => {
      const filterType = pill.dataset.filterType;
      const value = pill.dataset.value;

      if (filterType === 'type') {
        activeTypeFilter = value;
        document.querySelectorAll('[data-filter-type="type"]').forEach(p => p.classList.toggle('active', p.dataset.value === value));
      } else {
        activeStatusFilter = value;
        document.querySelectorAll('[data-filter-type="status"]').forEach(p => p.classList.toggle('active', p.dataset.value === value));
      }

      renderGrid();

      // Rebuild graph if currently visible (filter state persists)
      if (currentView === 'graph') {
        graphBuilt = false;
        buildGraph();
      }
    });
  });

  // Apply initial active state from state vars
  document.querySelectorAll('[data-filter-type="type"]').forEach(p =>
    p.classList.toggle('active', p.dataset.value === activeTypeFilter));
  document.querySelectorAll('[data-filter-type="status"]').forEach(p =>
    p.classList.toggle('active', p.dataset.value === activeStatusFilter));
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

  // Deduplicate edges: collect unique pairs
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

  // Clear previous
  d3.select(svgEl).selectAll('*').remove();
  if (simulation) simulation.stop();

  const svg = d3.select(svgEl)
    .attr('width', W)
    .attr('height', H);

  // Zoom/pan
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

  const nodeRadius = d => d.tier === 1 ? 16 : 11;

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-280))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 14));

  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', 'rgba(255,255,255,.12)')
    .attr('stroke-width', 1.5);

  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.append('circle')
    .attr('r', nodeRadius)
    .attr('fill', d => TYPE_COLOR[d.type] || '#4F8EF7')
    .attr('fill-opacity', d => d.status === 'coming-soon' ? 0.35 : 0.9)
    .attr('stroke', d => TYPE_COLOR[d.type] || '#4F8EF7')
    .attr('stroke-width', d => d.tier === 1 ? 2.5 : 1.5)
    .attr('stroke-opacity', 0.6);

  node.append('text')
    .text(d => d.title.length > 22 ? d.title.slice(0, 20) + '…' : d.title)
    .attr('text-anchor', 'middle')
    .attr('dy', d => nodeRadius(d) + 14)
    .attr('fill', 'rgba(226,232,240,.75)')
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
      tooltipType.style.color  = TYPE_COLOR[d.type] || '#4F8EF7';
      // Highlight edges
      link
        .attr('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.08)')
        .attr('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? 2.5 : 1.5);
    })
    .on('mousemove', e => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top  = (e.clientY - rect.top  - 8) + 'px';
    })
    .on('mouseout', () => {
      tooltip.classList.remove('visible');
      link.attr('stroke', 'rgba(255,255,255,.12)').attr('stroke-width', 1.5);
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

  // Hide spinner after warm-up
  setTimeout(() => spinner.classList.add('hidden'), 900);
}

/* ── Detail panel ────────────────────────────────── */
function openPanel(node) {
  const panel   = document.getElementById('detailPanel');
  const backdrop = document.getElementById('panelBackdrop');
  const badges  = document.getElementById('panelBadges');
  const body    = document.getElementById('panelBody');

  badges.innerHTML = `
    <span class="badge ${typeBadgeClass(node.type)}">${node.type}</span>
    <span class="badge ${statusBadgeClass(node.status)}">${statusLabel(node.status)}</span>
  `;

  const isSoon = node.status === 'coming-soon';

  if (node.type === 'testimonial') {
    body.innerHTML = `
      <h2 class="panel-title">${node.title}</h2>
      <p class="panel-meta">${node.date}</p>
      <blockquote class="panel-quote">"${node.description}"</blockquote>
      ${node.link ? `<a href="${node.link}" class="panel-action" target="_blank" rel="noopener">See original →</a>` : ''}
      ${connectedSection(node)}
    `;
  } else {
    const actionBtn = (!isSoon && node.link)
      ? `<a href="${node.link}" class="panel-action" target="_blank" rel="noopener">View ${node.type === 'blog' ? 'post' : 'project'} →</a>`
      : '';

    body.innerHTML = `
      <h2 class="panel-title">${node.title}</h2>
      <p class="panel-meta">${node.date}${node.tier ? ` · Tier ${node.tier}` : ''}</p>
      <p class="panel-desc">${node.description}</p>
      <div class="panel-tags">${node.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${actionBtn}
      ${connectedSection(node)}
    `;
  }

  panel.classList.add('open');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Wire connected-node mini-cards
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
  initFilters();
  renderGrid();
  initViewToggle();

  // Panel close handlers
  document.getElementById('panelClose').addEventListener('click', closePanel);
  document.getElementById('panelBackdrop').addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
}

document.addEventListener('DOMContentLoaded', init);
