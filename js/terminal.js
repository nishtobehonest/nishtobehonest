/* Terminal typewriter — reads nodes.json, types the boot sequence */

(function () {
  const CHAR_DELAY = 16;  // ms between chars when typing
  const SCAN_GAP   = 55;  // ms between project scan lines

  const body = document.getElementById('termBody');
  if (!body) return;

  /* ── Panel bridge ─────────────────────────────────── */

  function triggerPanel(section) {
    document.dispatchEvent(new CustomEvent('open-panel', { detail: section }));
  }

  /* ── DOM helpers ──────────────────────────────────── */

  function addLine(html) {
    const el = document.createElement('div');
    el.innerHTML = html;
    body.appendChild(el);
  }

  function addBlank() {
    const el = document.createElement('div');
    el.innerHTML = '&nbsp;';
    body.appendChild(el);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function typeLine(text, spanClass) {
    return new Promise(resolve => {
      const wrapper = document.createElement('div');
      const span = document.createElement('span');
      if (spanClass) span.className = spanClass;
      wrapper.appendChild(span);
      body.appendChild(wrapper);
      let i = 0;
      function step() {
        if (i < text.length) {
          span.textContent += text[i++];
          setTimeout(step, CHAR_DELAY);
        } else {
          resolve();
        }
      }
      step();
    });
  }

  /* ── Main sequence ───────────────────────────────── */

  async function run(nodes) {
    const projects = nodes.filter(n => n.type === 'project');
    const inProg   = nodes.filter(n => n.status === 'in-progress' && n.type === 'project');
    const learning = nodes.filter(n => n.type === 'learning');
    const tier1    = projects.filter(n => n.tier === 1);
    const SHOW     = tier1.slice(0, 5);
    const rest     = projects.length - SHOW.length;

    // Header
    await typeLine('> nishchay.me — agent log', 'term-prompt');
    await sleep(60);
    addLine('<span class="term-divider">──────────────────────────────</span>');
    addBlank();
    await sleep(180);
    addLine('<span class="term-label">AGENTIC SYSTEM DESIGN  ·  BUILDER  ·  PM  ·  FDE  ·  GEOSPATIAL / OPERATIONAL AI  ·  CORNELL MEM  ·  2026</span>');
    addBlank();
    await sleep(200);

    // Agent boot
    await typeLine('> agent runtime: active', 'term-prompt');
    await sleep(120);
    await typeLine('> memory: loaded  ·  tools: bound', 'term-prompt');
    addBlank();
    await sleep(280);

    // Registry
    await typeLine('> scanning project registry...', 'term-prompt');
    addBlank();
    await sleep(380);

    // Project lines — pad with dots to align status icons; titles are clickable
    const maxLen = Math.max(...SHOW.map(n => n.title.length));
    for (const node of SHOW) {
      const dotCount = Math.max(maxLen - node.title.length + 4, 4);
      const dots = '.'.repeat(dotCount);
      let statusHtml;
      if (node.status === 'shipped') {
        statusHtml = `<span class="term-shipped"> ✓</span>`;
      } else if (node.status === 'in-progress') {
        statusHtml = `<span class="term-progress"> ↻</span>`;
      } else {
        statusHtml = `<span class="term-muted"> ○</span>`;
      }
      addLine(`<span><button class="term-link" data-slug="${node.slug}">${node.title}</button> <span class="term-muted">${dots}</span>${statusHtml}</span>`);
      await sleep(SCAN_GAP);
    }

    if (rest > 0) {
      await sleep(30);
      addLine(`<span class="term-muted">[ and ${rest} more in the graph ]</span>`);
    }
    addBlank();
    await sleep(480);

    // Confidence gates
    await typeLine('> confidence gate: 0.23 → human review', 'term-gate');
    await sleep(180);
    await typeLine('> confidence gate: 0.87 → proceed', 'term-gate');
    await sleep(180);
    await typeLine('> confidence gate: 0.41 → ambiguous → human review', 'term-gate');
    addBlank();
    await sleep(280);

    // Experience + stack
    await typeLine('> 3 yrs operational AI at Aereo  ·  geospatial  ·  mining, construction, infrastructure', 'term-stat');
    await sleep(180);
    await typeLine('> stack: LangChain · LangGraph · FastAPI · Anthropic SDK · Apache Sedona', 'term-stat');
    addBlank();
    await sleep(280);

    // Stats
    addLine(`<span class="term-stat">> ${projects.length} projects  ·  ${inProg.length} in progress  ·  ${learning.length} in research</span>`);
    addBlank();
    await sleep(360);

    // CTA
    await typeLine('> open to: FDE · Agentic PM · AI PM roles', 'term-gate');
    await sleep(120);
    addLine('<span class="term-cta"><a href="https://calendly.com/nishchay26/new-meeting" target="_blank" rel="noopener" class="term-cta-link">↗ book a call</a>  ·  <a href="mailto:nishchay26@gmail.com" class="term-cta-link">nishchay26@gmail.com</a></span>');
    addBlank();
    await sleep(280);

    // Final prompt with blinking cursor
    const wrapper = document.createElement('div');
    const span = document.createElement('span');
    span.className = 'term-prompt';
    wrapper.appendChild(span);
    body.appendChild(wrapper);
    const prompt = '> select a section [1/2/3/4]  ';
    for (const ch of prompt) {
      span.textContent += ch;
      await sleep(CHAR_DELAY);
    }
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    wrapper.appendChild(cursor);

    // Wire up clickable project titles
    body.querySelectorAll('.term-link').forEach(btn => {
      btn.addEventListener('click', () => triggerPanel('projects'));
    });

    // Keyboard navigation — fire once per session
    const keyMap = { '1': 'work', '2': 'projects', '3': 'thinking', '4': 'about',
                     'w': 'work', 'p': 'projects', 't': 'thinking', 'a': 'about' };
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const section = keyMap[e.key];
      if (section) {
        triggerPanel(section);
      } else if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-panel'));
      }
    }
    document.addEventListener('keydown', onKey);
  }

  /* ── Boot ────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    fetch('data/nodes.json')
      .then(r => r.json())
      .then(nodes => run(nodes))
      .catch(() => {
        const el = document.createElement('div');
        el.innerHTML = '<span class="term-muted">// error loading data</span>';
        body.appendChild(el);
      });
  });
})();
