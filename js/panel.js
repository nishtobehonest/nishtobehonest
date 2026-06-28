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
      <div class="about-caps-accordion">
        ${[
          { title: 'Discovery and customer understanding', bullets: [
            'On-site field discovery with enterprise customers before any spec exists',
            'Translating ambiguous, emotionally loaded customer asks into crisp problem statements',
            'Building trust with skeptical, non-technical field users who have deeply embedded manual processes',
            'Distinguishing the stated problem from the real one',
            'Owning the customer relationship end to end across multiple stakeholder levels simultaneously',
          ]},
          { title: 'AI product judgment', bullets: [
            'Designing human-in-the-loop validation workflows for AI outputs in high-stakes environments',
            'Identifying silent failure risk before it reaches users',
            'Knowing when to automate fully versus when to keep a human in the loop, and being able to defend that call',
            'Defining eval categories, failure modes, and what done actually looks like for an AI feature',
            'Understanding the difference between model accuracy and user trust, and knowing which one to optimize first',
            'Prompt engineering and iteration, not as a technical exercise but as a product discipline',
          ]},
          { title: 'Agent and system architecture', bullets: [
            'Designing multi-agent pipelines where each agent has a single, narrow job',
            'Scoping agentic solutions with four parts: trigger, action with confidence, human handoff, log',
            'Understanding RAG pipeline design including chunking strategy, embedding model choice, and where retrieval actually breaks',
            'Building eval frameworks that test accuracy, hallucination rate, retrieval quality, and latency',
            'Reading agent architectures and spotting where they will fail in production before they do',
          ]},
          { title: 'Prototyping and building', bullets: [
            'Can build a working prototype fast enough to show engineers what you mean, not just describe it',
            'Built a Site Intelligence Agent with FastAPI, ChromaDB, and the Anthropic SDK, tested against 85 eval cases, under 2% hallucination',
            'Built a multi-agent healthcare triage system from scratch in an unfamiliar domain under a hard deadline',
            'Uses Claude Code daily as a real tool, not a claimed interest',
            'Can write enough code to have a real conversation with engineers, not just nod along',
          ]},
          { title: 'Platform and systems thinking', bullets: [
            'Recognizing when a system is breaking because of wrong assumptions, not wrong performance',
            'Designing stage-based workflows with validation gates and guardrails that prevent misuse at the system level',
            'Understanding how scale changes user behavior and what breaks first',
            'Distinguishing load-bearing architectural decisions from implementation details',
          ]},
          { title: 'Execution and delivery', bullets: [
            'End-to-end ownership from problem definition through launch through stabilization',
            'Writing PRDs and acceptance criteria that encode expert constraints as safe defaults',
            'Making hard, unpopular prioritization calls under sales pressure',
            'Cross-team coordination without process theater',
            'Release readiness judgment — knowing when something is safe to ship and when it is not',
          ]},
          { title: 'Data and quantitative thinking', bullets: [
            'SQL background from Aereo, comfortable enough to run your own queries rather than wait for an analyst',
            'Built operational dashboards and analytics workflows for enterprise clients',
            'Comfortable with unit economics, cost-per-query reasoning, and accuracy versus cost tradeoffs',
          ]},
          { title: 'Operating without a safety net', bullets: [
            'Founded and ran a business end to end, hired and led a team, operated without structure or support',
            'Can do whatever-it-takes work when the gap needs filling, not just the work on the job description',
            'No notice period, ready to move when the right thing comes along',
          ]},
        ].map((cap, i) => `
          <div class="cap-item">
            <button class="cap-trigger" data-cap="${i}">
              <span class="cap-title">${cap.title}</span>
              <span class="cap-chevron">›</span>
            </button>
            <div class="cap-detail" id="cap-detail-${i}">
              <ul class="cap-bullets">
                ${cap.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          </div>`).join('')}
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

    bodyEl.querySelectorAll('.cap-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const detail = bodyEl.querySelector(`#cap-detail-${btn.dataset.cap}`);
        const isOpen = btn.classList.contains('open');
        btn.classList.toggle('open', !isOpen);
        detail.classList.toggle('open', !isOpen);
      });
    });
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
