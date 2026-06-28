/* Homepage slide-in panel system — 4 section renderers */

(function () {
  let nodesCache = null;
  let currentPanel = null;

  async function getNodes() {
    if (!nodesCache) {
      const res = await fetch('data/nodes.json');
      nodesCache = await res.json();
    }
    return nodesCache;
  }

  /* ── DOM refs ─────────────────────────────────────── */
  const panel    = document.getElementById('canvasPanel');
  const overlay  = document.getElementById('panelOverlay');
  const titleEl  = document.getElementById('panelTitle');
  const bodyEl   = document.getElementById('panelBody');
  const closeBtn = document.getElementById('panelClose');

  if (!panel) return;

  /* ── Open / close ────────────────────────────────── */
  const TITLES = { work: '01 / WORK', projects: '02 / PROJECTS', thinking: '03 / THINKING', about: '04 / ABOUT' };

  function openPanel(section) {
    if (currentPanel === section && panel.classList.contains('open')) {
      closePanel();
      return;
    }
    currentPanel = section;
    titleEl.textContent = TITLES[section] || section;

    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.panel === section);
    });

    bodyEl.innerHTML = '';
    renderSection(section);
    panel.classList.add('open');
    overlay.classList.add('active');
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    currentPanel = null;
  }

  /* ═══════════════════════════════════════════════════
     WORK — hardcoded accordion
  ═══════════════════════════════════════════════════ */

  const WORK = [
    {
      year: '2025 → 2026',
      company: 'Cornell University',
      role: 'MEng Management',
      bullets: [
        'Product strategy and AI systems engineering focus',
        'AI for Engineering Management coursework'
      ]
    },
    {
      year: 'Jan → May 2026',
      company: 'ServiceNow',
      role: 'Enterprise AI Product Consultant',
      bullets: [
        'Cornell DTI engagement — root-cause analysis of enterprise AI adoption drop-off',
        'Tested LLM Build Agent across no-code, low-code, and pro-code developer personas',
        'Presented agentic AI readiness portfolio to App Engine GM'
      ]
    },
    {
      year: '2022 → 2025',
      company: 'Aereo',
      role: 'Product Manager',
      bullets: [
        'Owned geospatial data products for mining and infrastructure clients',
        'Scaled spatial analytics pipeline 800× — 25K to 20M+ data points in production',
        'Built 300-feature roadmap supporting $15M Series B; supported $1.5M deal close'
      ]
    }
  ];

  function renderWork() {
    bodyEl.innerHTML = `
      <div class="work-accordion">
        ${WORK.map((item, i) => `
          <div class="work-item">
            <button class="work-trigger" data-idx="${i}">
              <span class="work-year">${item.year}</span>
              <span class="work-company">${item.company}</span>
              <span class="work-role">${item.role}</span>
              <span class="work-chevron">›</span>
            </button>
            <div class="work-detail">
              <ul class="work-bullets">
                ${item.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>`;

    bodyEl.querySelectorAll('.work-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const detail = btn.nextElementSibling;
        const isOpen = btn.classList.contains('open');
        bodyEl.querySelectorAll('.work-trigger').forEach(b => {
          b.classList.remove('open');
          b.nextElementSibling.classList.remove('open');
        });
        if (!isOpen) {
          btn.classList.add('open');
          detail.classList.add('open');
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     PROJECTS — card grid with filters
  ═══════════════════════════════════════════════════ */

  async function renderProjects() {
    bodyEl.innerHTML = `<span style="font-family:var(--font-mono);font-size:.75rem;color:var(--muted)">loading...</span>`;
    const nodes = await getNodes();
    const projects = nodes
      .filter(n => n.type === 'project')
      .sort((a, b) => a.tier - b.tier || b.date.localeCompare(a.date));

    function rowHtml(node) {
      const isSoon = node.status === 'coming-soon';
      const Tag    = node.link && !isSoon ? 'a' : 'div';
      const attrs  = node.link && !isSoon ? `href="${node.link}" target="_blank" rel="noopener"` : '';
      return `
        <${Tag} class="proj-row${isSoon ? ' proj-row-soon' : ''}" ${attrs}>
          <span class="proj-date">${node.date}</span>
          <span class="proj-title">${node.title}</span>
          <span class="proj-status">${statusLabel(node.status)}</span>
          <span class="proj-chevron">›</span>
        </${Tag}>`;
    }

    function rebuild() {
      bodyEl.innerHTML = `
        <div class="proj-list">
          ${projects.map(rowHtml).join('')}
        </div>
        <a href="explore.html" class="view-graph-link">→ View full knowledge graph</a>`;
    }

    rebuild();
  }

  /* ═══════════════════════════════════════════════════
     THINKING — blog + learning list
  ═══════════════════════════════════════════════════ */

  async function renderThinking() {
    bodyEl.innerHTML = `<span style="font-family:var(--font-mono);font-size:.75rem;color:var(--muted)">loading...</span>`;
    const nodes = await getNodes();
    const items = nodes
      .filter(n => n.type === 'blog' || n.type === 'learning')
      .sort((a, b) => b.date.localeCompare(a.date));

    if (!items.length) {
      bodyEl.innerHTML = `<p style="color:var(--muted);font-size:.875rem">Nothing here yet.</p>`;
      return;
    }

    bodyEl.innerHTML = `
      <div class="thinking-list">
        ${items.map(node => {
          const typeLabel = node.type === 'blog' ? 'Writing' : 'Learning';
          const hasLink   = node.link && node.status !== 'coming-soon';
          const titleInner = hasLink
            ? `<a href="${node.link}" target="_blank" rel="noopener" class="thinking-item-title">${node.title}</a>`
            : `<p class="thinking-item-title">${node.title}${node.status === 'coming-soon' ? ' <span style="color:var(--muted);font-size:.7rem">— coming soon</span>' : ''}</p>`;
          return `
            <div class="thinking-item">
              ${titleInner}
              <p class="thinking-item-desc">${node.description}</p>
              <span class="thinking-item-meta">${typeLabel}  ·  ${node.date}</span>
            </div>`;
        }).join('')}
      </div>`;
  }

  /* ═══════════════════════════════════════════════════
     ABOUT — bio + education + testimonials
  ═══════════════════════════════════════════════════ */

  async function renderAbout() {
    const nodes = await getNodes();
    const testimonials = nodes.filter(n => n.type === 'testimonial' && n.status === 'shipped');

    bodyEl.innerHTML = `
      <p class="about-bio">Agentic PM. Cornell MEM 2026.
I build AI systems that fail gracefully —
RAG pipelines, MCP servers, memory architectures,
for environments where wrong answers cost something.

3 years in product. Focus: FDE/PM at Series A/B
startups bringing AI into physical-world operations —
geospatial, autonomous systems, industrial ops.</p>

      <span class="about-section-label">What I sell</span>
      <p class="about-pitch">I sit at the gap between what an AI system can do and whether real users will actually trust and use it. I have done that for enterprise customers in production environments where wrong outputs affected safety and compliance decisions. I can prototype, design the architecture, write the requirements, coordinate the engineers, earn the trust of skeptical field teams, and own the outcome. That combination is what is genuinely rare right now.</p>

      <span class="about-section-label">Capabilities</span>
      <ul class="about-caps">
        <li>Discovery and customer understanding</li>
        <li>AI product judgment</li>
        <li>Agent and system architecture</li>
        <li>Prototyping and building</li>
        <li>Platform and systems thinking</li>
        <li>Execution and delivery</li>
        <li>Data and quantitative thinking</li>
        <li>Operating without a safety net</li>
      </ul>

      <span class="about-section-label">Education</span>
      <div class="about-edu">
        Cornell University <span class="edu-sep">/</span> MEng Management <span class="edu-sep">/</span> 2025–2026
      </div>

      <span class="about-section-label">What people say</span>
      <div class="about-testimonials">
        ${testimonials.map(node => `
          <div class="testimonial-card">
            <blockquote class="tcard-quote">"${node.description}"</blockquote>
            <div>
              <p class="tcard-name">${node.title}</p>
              ${node.author_title ? `<p class="tcard-role">${node.author_title}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>`;
  }

  /* ── Dispatcher ──────────────────────────────────── */

  function renderSection(section) {
    switch (section) {
      case 'work':     renderWork();     break;
      case 'projects': renderProjects(); break;
      case 'thinking': renderThinking(); break;
      case 'about':    renderAbout();    break;
    }
  }

  /* ── Event wiring ────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => openPanel(btn.dataset.panel));
    });
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && currentPanel) closePanel();
    });
  });
})();
