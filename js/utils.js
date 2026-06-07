/* Shared badge helpers — used by main.js and explorer.js */

function typeBadgeClass(type) {
  return {
    project:     'badge-project',
    blog:        'badge-blog',
    learning:    'badge-learning',
    testimonial: 'badge-testimonial',
  }[type] || 'badge-project';
}

function statusBadgeClass(status) {
  return {
    shipped:        'badge-shipped',
    'in-progress':  'badge-in-progress',
    learning:       'badge-learning-st',
    'coming-soon':  'badge-coming-soon',
  }[status] || 'badge-coming-soon';
}

function statusLabel(status) {
  return {
    shipped:        'Shipped',
    'in-progress':  'In progress',
    learning:       'Learning',
    'coming-soon':  'Coming soon',
  }[status] || status;
}
