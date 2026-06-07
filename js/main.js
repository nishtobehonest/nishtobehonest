/* Landing page: loads featured nodes + scroll animations + dot nav */

const NODES_URL = 'data/nodes.json';

async function loadFeatured() {
  const res = await fetch(NODES_URL);
  const nodes = await res.json();
  const featured = nodes.filter(n => n.tier === 1 && n.type === 'project').slice(0, 3);
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = featured.map(renderNodeCard).join('');
}

function statusBadgeClass(status) {
  return {
    'shipped':     'badge-shipped',
    'in-progress': 'badge-in-progress',
    'learning':    'badge-learning-st',
    'coming-soon': 'badge-coming-soon',
  }[status] || 'badge-coming-soon';
}

function statusLabel(status) {
  return {
    'shipped':     'Shipped',
    'in-progress': 'In progress',
    'learning':    'Learning',
    'coming-soon': 'Coming soon',
  }[status] || status;
}

function typeBadgeClass(type) {
  return {
    'project':     'badge-project',
    'blog':        'badge-blog',
    'learning':    'badge-learning',
    'testimonial': 'badge-testimonial',
  }[type] || 'badge-project';
}

function renderNodeCard(node) {
  const isSoon = node.status === 'coming-soon';
  const linkEl = (!isSoon && node.link)
    ? `<a href="${node.link}" class="node-link" target="_blank" rel="noopener" onclick="event.stopPropagation()">View project →</a>`
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
      <div class="node-tags">${node.tags.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${linkEl}
    </div>`;
}

/* ── Scroll dot nav ──────────────────────────────── */
function initScrollDots() {
  const dots = document.querySelectorAll('.scroll-dot');
  const sections = ['hero', 'paths', 'featured'].map(id => document.getElementById(id));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach(d => d.classList.toggle('active', d.dataset.section === id));
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => s && observer.observe(s));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const el = document.getElementById(dot.dataset.section);
      el?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ── Fade-up animations ─────────────────────────── */
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.15 });
  els.forEach(el => observer.observe(el));
}

/* ── Init ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadFeatured();
  initScrollDots();
  initFadeUp();
});
