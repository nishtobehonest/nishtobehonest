/* Homepage panel system — sections replace the terminal column */

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
  const termView = document.getElementById('terminalView');
  const sectView = document.getElementById('sectionView');
  const titleEl  = document.getElementById('panelTitle');
  const bodyEl   = document.getElementById('panelBody');
  const closeBtn = document.getElementById('panelClose');

  if (!sectView) return;

  /* ── Open / close ────────────────────────────────── */
  const TITLES = { work: '01 / WORK', projects: '02 / PROJECTS', thinking: '03 / THINKING', about: '04 / ABOUT' };

  function openPanel(section) {
    if (currentPanel === section) { closePanel(); return; }
    currentPanel = section;
    titleEl.textContent = TITLES[section] || section;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.panel === section);
    });
    bodyEl.innerHTML = '';
    renderSection(section);
    termView.hidden = true;
    sectView.hidden = false;
  }

  function closePanel() {
    sectView.hidden = true;
    termView.hidden = false;
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
      <div class="about-bio">
        <p>PM background, CS foundation, three years in production AI at Aereo — geospatial SaaS serving mining, construction, and infrastructure clients. That's where I learned what operational AI actually means: messy data, high stakes, enterprise buyers who won't act on outputs they can't trust.</p>
        <p>I'm interested in the agentic system design problem: how do you build agents that route correctly, fail gracefully, and hand off to humans in a way that actually works?</p>
        <p>At Cornell I've been building that layer — multi-agent RAG, HITL escalation, MCP servers, eval frameworks. I want a role where I'm designing and shipping these systems, not just writing docs about them.</p>
        <p class="about-stem">STEM OPT · Open to FDE, Agentic PM, AI PM, and product builder roles.</p>
      </div>

      <span class="about-section-label">What I bring</span>
      <div class="proof-grid">
        <span class="proof-label">Agentic system design</span>
        <span class="proof-value">3-path routing agent: confident answer, conflict surfaced, programmatic escalation</span>
        <span class="proof-label">Operational AI in production</span>
        <span class="proof-value">Scaled imagery pipeline 800× (25K to 20M+ data points) at Aereo</span>
        <span class="proof-label">HITL escalation design</span>
        <span class="proof-value">Conflict-detection layer that surfaced disagreement between spatial risk score and inspection history — plain-English explanation and counterfactual to the human reviewer</span>
        <span class="proof-label">Full-stack deployment</span>
        <span class="proof-value">RAG pipeline to human review interface to cloud — end-to-end, not just localhost</span>
        <span class="proof-label">LLM eval frameworks</span>
        <span class="proof-value">85 adversarial test cases, under 2% hallucination rate, confidence scoring and graceful degradation</span>
        <span class="proof-label">Enterprise trust layer</span>
        <span class="proof-value">Audit and review workflows that closed a $1.5M government contract</span>
      </div>

      <span class="about-section-label">Stack</span>
      <div class="about-stack">
        <span>Python</span><span>LangChain</span><span>LangGraph</span><span>FastAPI</span><span>Anthropic SDK</span>
        <span>React</span><span>Vite</span><span>Tailwind</span><span>Leaflet.js</span>
        <span>Apache Sedona</span><span>Wherobots Cloud</span><span>Chroma</span><span>Streamlit</span>
        <span>SQL</span><span>QGIS</span><span>Power BI</span><span>Claude Code</span><span>Vercel</span>
      </div>

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
    document.addEventListener('open-panel', e => openPanel(e.detail));
    document.addEventListener('close-panel', () => { if (currentPanel) closePanel(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && currentPanel) closePanel();
    });
  });
})();
