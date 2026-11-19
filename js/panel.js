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
      year: '2026 → now',
      company: 'AuxoAI',
      role: 'Forward Deployed Strategist',
      teaser: 'Synthetic market research for enterprise clients: AI personas built from real survey data. I prove they\'re faithful, benchmark the models behind them, and run studies with them.',
      bullets: [
        'Proved 3,031 of 3,031 AI personas matched the real respondents they came from, and found a hidden 10.5-point gender skew in the platform',
        'Benchmarked two AI models against real human survey answers: 79% vs 68% directional accuracy',
        'Built AI-driven mobile site tests for a U.S. steakhouse chain; a details-first offer page lifted reservation success from 67% to 93%',
        'Built the agent engine and student kit for a hands-on AI-agent bootcamp at Cornell Tech, and co-led it for ~70 graduate students'
      ]
    },
    {
      year: '2026',
      company: 'ServiceNow',
      role: 'Agentic AI Product Consultant (contract, via Cornell DTI)',
      teaser: 'Enterprise engagement on AI Build Agent deployment strategy for ServiceNow App Engine. Findings presented to the App Engine GM and Director.',
      bullets: [
        'Ran 76-step hands-on testing of the Build Agent across no-code, low-code and pro-code personas',
        'Uncovered a critical onboarding access gap that reframed the engagement from scripting complexity to an AI adoption and perception gap',
        'Built a 6-parameter scoring framework that narrowed 8 strategic bets to 5, and delivered an agentic AI readiness portfolio with an A+/B/C trust tier model for when enterprise apps can graduate to autonomous agents'
      ]
    },
    {
      year: '2022 → 2025',
      company: 'Aereo',
      role: 'Product Manager (promoted from APM)',
      teaser: 'Scaled drone imagery processing 800× and built the trust layer enterprise clients relied on. Supported a $1M deal, a $500K contract and a $15M Series B.',
      bullets: [
        'Grew imagery processing from 25K to 20M+ images, including 7M drone images in 5 months for enterprise deployments',
        'Built review and validation workflows that made automated outputs trustworthy for enterprise and government clients; ~1.5× adoption and ~30% fewer support tickets (est.)',
        'Built a 300+ feature roadmap from customer needs and a 9-competitor benchmark; supported the $15M Series B raise'
      ]
    },
    {
      year: '2020 → 2022',
      company: 'PokerClothingStore.com',
      role: 'Founder',
      teaser: 'Built an e-commerce brand from zero to 400+ sales in 18 months with a 5-person team.',
      bullets: [
        'Owned growth, funnel tracking and execution end to end',
        'Ran 40+ A/B tests on targeting and creatives: ~20% lower costs, ~2x ROAS'
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
            ${item.teaser ? `<p class="work-teaser">${item.teaser}</p>` : ''}
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
        const detail = btn.closest('.work-item').querySelector('.work-detail');
        const isOpen = btn.classList.contains('open');
        bodyEl.querySelectorAll('.work-trigger').forEach(b => {
          b.classList.remove('open');
          b.closest('.work-item').querySelector('.work-detail').classList.remove('open');
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

    function termStatus(status) {
      if (status === 'shipped')     return '<span class="term-shipped">✓</span>';
      if (status === 'in-progress') return '<span class="term-progress">↻</span>';
      return '<span class="term-muted">○</span>';
    }

    function rowHtml(node) {
      const isSoon = node.status === 'coming-soon';
      const Tag    = node.link && !isSoon ? 'a' : 'div';
      const attrs  = node.link && !isSoon ? `href="${node.link}" target="_blank" rel="noopener"` : '';
      const tags   = (node.tags || []).slice(0, 5).map(t => `<span class="proj-tag">${t}</span>`).join('');
      return `
        <${Tag} class="proj-row${isSoon ? ' proj-row-soon' : ''}" ${attrs}>
          <span class="proj-date">${node.date}</span>
          <span class="proj-title-group">
            <span class="proj-title">${node.title}</span>
            <span class="proj-desc">${node.description}</span>
            ${tags ? `<span class="proj-tags">${tags}</span>` : ''}
          </span>
          <span class="proj-status">${termStatus(node.status)}</span>
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
      .sort((a, b) => {
        const aS = a.status === 'coming-soon' ? 1 : 0;
        const bS = b.status === 'coming-soon' ? 1 : 0;
        if (aS !== bS) return aS - bS;
        return b.date.localeCompare(a.date);
      });

    if (!items.length) {
      bodyEl.innerHTML = `<p style="color:var(--muted);font-size:.875rem">Nothing here yet.</p>`;
      return;
    }

    bodyEl.innerHTML = `
      <div class="thinking-list">
        ${items.map(node => {
          const typeLabel = node.type === 'blog' ? 'Writing' : 'Learning';
          const hasLink   = node.link && node.status !== 'coming-soon';
          const tags      = (node.tags || []).map(t => `<span class="thinking-tag">${t}</span>`).join('');
          const isSoon    = node.status === 'coming-soon';
          const inner = `
            <p class="thinking-item-title">${node.title}${isSoon ? ' <span class="thinking-soon">— coming soon</span>' : ''}</p>
            <p class="thinking-item-desc">${node.description}</p>
            ${tags ? `<div class="thinking-tags">${tags}</div>` : ''}
            <span class="thinking-item-meta">${typeLabel}  ·  ${node.date}</span>`;
          return hasLink
            ? `<a class="thinking-item thinking-item-link" href="${node.link}" target="_blank" rel="noopener">${inner}</a>`
            : `<div class="thinking-item">${inner}</div>`;
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
        <p>At Cornell I built that layer — multi-agent RAG, HITL escalation, MCP servers, eval frameworks.</p>
        <p>Now I'm a Forward Deployed Strategist at AuxoAI in New York. I work on synthetic market research for enterprise clients: validating AI personas against real survey data, scoring the models behind them, and building the agents that run the studies.</p>
        <p class="about-stem">New York · STEM OPT</p>
      </div>

      <span class="about-section-label" id="about-stack">Stack</span>
      <div class="stack-groups">
        <div class="stack-group">
          <span class="stack-group-label">AI &amp; Engineering</span>
          <div class="stack-pills">
            ${['Python','LangChain','LangGraph','FastAPI','Anthropic SDK','Playwright','Node.js','Apache Sedona','Chroma','Streamlit','Claude Code','React','SQL','QGIS'].map(t=>`<span class="stack-pill stack-pill-teal">${t}</span>`).join('')}
            ${['TypeScript','PostgreSQL','Docker','Next.js'].map(t=>`<span class="stack-pill stack-pill-learning" title="in progress">${t}</span>`).join('')}
          </div>
        </div>
        <div class="stack-group">
          <span class="stack-group-label">Product &amp; Strategy</span>
          <div class="stack-pills">
            ${['Agent behavior specs','Eval framework design','HITL workflow design','Roadmapping','User research','Stakeholder communication','Prioritization','PRDs','Go-to-market strategy','Demo building','Technical documentation','OKRs','A/B testing','Notion','Linear','Figma'].map(t=>`<span class="stack-pill stack-pill-blue">${t}</span>`).join('')}
            ${['API / developer experience design'].map(t=>`<span class="stack-pill stack-pill-learning" title="in progress">${t}</span>`).join('')}
          </div>
        </div>
        <div class="stack-group">
          <span class="stack-group-label">Business</span>
          <div class="stack-pills">
            ${['Enterprise sales support','Competitive analysis','Financial modeling','Market sizing','Negotiation','Executive communication','Customer success handoff'].map(t=>`<span class="stack-pill stack-pill-amber">${t}</span>`).join('')}
            ${['Partnership development','Revenue modeling'].map(t=>`<span class="stack-pill stack-pill-learning" title="in progress">${t}</span>`).join('')}
          </div>
        </div>
        <div class="stack-group">
          <span class="stack-group-label">Forward Deployed Engineering</span>
          <div class="stack-pills">
            ${['Rapid prototyping','POC / demo delivery','Bespoke artifact creation','Solution architecture','Customer technical discovery','API integration','Field deployment','Customer onboarding'].map(t=>`<span class="stack-pill stack-pill-purple">${t}</span>`).join('')}
          </div>
        </div>
      </div>

      <span class="about-section-label">What I bring</span>
      <div class="proof-grid">
        <span class="proof-label">Agentic system design</span>
        <span class="proof-value">3-path routing agent: confident answer, conflict surfaced, programmatic escalation</span>
        <span class="proof-label">Agent behavior spec</span>
        <span class="proof-value">Defined routing logic, confidence thresholds, and HITL override conditions as explicit PRD requirements before engineering build</span>
        <span class="proof-label">Synthetic research validation</span>
        <span class="proof-value">Proved 3,031/3,031 AI personas matched their source survey and found a 10.5-point platform weighting skew at AuxoAI</span>
        <span class="proof-label">LLM benchmarking</span>
        <span class="proof-value">Scored two LLM engines against a 153-tab human survey: 79% vs 68% directional accuracy</span>
        <span class="proof-label">Operational AI in production</span>
        <span class="proof-value">Scaled imagery pipeline 800× (25K to 20M+ data points) at Aereo</span>
        <span class="proof-label">HITL escalation design</span>
        <span class="proof-value">HITL conflict-detection on live PHMSA pipeline data — surfaces disagreement between spatial risk score and inspection history with plain-English explanation and counterfactual</span>
        <span class="proof-label">Full-stack deployment</span>
        <span class="proof-value">RAG pipeline to human review interface to cloud — end-to-end, not just localhost</span>
        <span class="proof-label">LLM eval frameworks</span>
        <span class="proof-value">85 adversarial test cases, under 2% hallucination rate, confidence scoring and graceful degradation</span>
        <span class="proof-label">Geospatial data products</span>
        <span class="proof-value">Drone imagery, spatial risk scoring, pipeline inspection data — operational AI on physical-world data at production scale</span>
        <span class="proof-label">Enterprise trust layer</span>
        <span class="proof-value">Audit and review workflows that supported a $1M deal and $500K contract</span>
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
        <a href="https://www.linkedin.com/in/nishchay-v/" target="_blank" rel="noopener" class="more-recs-link">↗ More recommendations on LinkedIn</a>
      </div>

      <div class="about-cta">
        <p class="about-cta-label">Get in touch</p>
        <div class="about-cta-links">
          <a href="https://calendly.com/nishchay26/new-meeting" target="_blank" rel="noopener" class="cta-btn cta-btn-primary">↗ Book a 30-min call</a>
          <a href="mailto:nishchay26@gmail.com" class="cta-btn cta-btn-secondary">↗ nishchay26@gmail.com</a>
          <a href="/Nishchay_Vishwanath_Resume.pdf" download class="cta-btn cta-btn-secondary">↗ Resume PDF</a>
        </div>
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

  function scrollToStack() {
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById('about-stack');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < 20) {
        requestAnimationFrame(() => tryScroll(attempts + 1));
      }
    };
    requestAnimationFrame(tryScroll);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => openPanel(btn.dataset.panel));
    });
    document.querySelectorAll('.id-domain-pill').forEach(btn => {
      btn.addEventListener('click', () => { openPanel('about'); scrollToStack(); });
    });
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('open-panel', e => openPanel(e.detail));
    document.addEventListener('close-panel', () => { if (currentPanel) closePanel(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && currentPanel) closePanel();
    });
  });
})();
