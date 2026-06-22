/* Landing page: loads featured nodes + scroll animations + dot nav */

const NODES_URL = 'data/nodes.json';

async function loadContent() {
  const res = await fetch(NODES_URL);
  const nodes = await res.json();

  loadBuildingStrip(nodes);

  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid) {
    const featured = nodes.filter(n => n.tier === 1 && n.type === 'project').slice(0, 3);
    featuredGrid.innerHTML = featured.map(renderNodeCard).join('');
  }

  const testimonialsGrid = document.getElementById('testimonialsGrid');
  if (testimonialsGrid) {
    const testimonials = nodes.filter(n => n.type === 'testimonial' && n.status === 'shipped');
    testimonialsGrid.innerHTML = testimonials.map(renderTestimonialCard).join('');
    testimonialsGrid.querySelectorAll('.fade-up').forEach(el => {
      fadeObserver.observe(el);
    });
  }
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
          ${node.type !== 'testimonial' ? `<span class="badge ${statusBadgeClass(node.status)}">${statusLabel(node.status)}</span>` : ''}
        </div>
        <span class="node-date">${node.date}</span>
      </div>
      <h3 class="node-title">${node.title}</h3>
      <p class="node-desc">${node.description}</p>
      <div class="node-tags">${node.tags.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${linkEl}
    </div>`;
}

function renderTestimonialCard(node) {
  return `
    <div class="testimonial-card fade-up">
      <blockquote class="tcard-quote">"${node.description}"</blockquote>
      <div class="tcard-footer">
        <p class="tcard-name">${node.title}</p>
        ${node.author_title ? `<p class="tcard-role">${node.author_title}</p>` : ''}
      </div>
    </div>`;
}

/* ── Scroll dot nav ──────────────────────────────── */
function initScrollDots() {
  const dots = document.querySelectorAll('.scroll-dot');
  const sections = ['hero', 'paths', 'featured', 'testimonials'].map(id => document.getElementById(id));

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
let fadeObserver;
function initFadeUp() {
  fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));
}

/* ── Building strip ─────────────────────────────── */
function loadBuildingStrip(nodes) {
  const inProgress = nodes.filter(n => n.status === 'in-progress' && n.type === 'project');
  const strip = document.getElementById('buildingStrip');
  const container = document.getElementById('buildingLinks');
  if (!strip || !container) return;
  if (!inProgress.length) { strip.style.display = 'none'; return; }
  container.innerHTML = inProgress.map((n, i) =>
    `${i > 0 ? '<span class="building-sep">, </span>' : ''}<a href="explore.html" class="building-link">${n.title}</a>`
  ).join('');
}

/* ── Init ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initFadeUp();
  loadContent();
  initScrollDots();
});
