document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // Menu category filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const categories = document.querySelectorAll('.menu-category');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      categories.forEach(cat => {
        if (filter === 'all' || cat.dataset.category === filter) {
          cat.classList.remove('hidden');
        } else {
          cat.classList.add('hidden');
        }
      });
    });
  });

  // Menu search
  const searchInput = document.querySelector('.menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const items = document.querySelectorAll('.menu-item');
      if (q === '') {
        items.forEach(i => i.classList.remove('hidden'));
        categories.forEach(c => c.classList.remove('hidden'));
        return;
      }
      // Reset filter buttons to "All"
      filterBtns.forEach(b => b.classList.remove('active'));
      filterBtns[0]?.classList.add('active');
      categories.forEach(c => c.classList.remove('hidden'));

      items.forEach(item => {
        const searchable = (item.dataset.search + ' ' + item.textContent).toLowerCase();
        item.classList.toggle('hidden', !searchable.includes(q));
      });
      // Hide empty categories
      categories.forEach(cat => {
        const visible = cat.querySelectorAll('.menu-item:not(.hidden)');
        cat.classList.toggle('hidden', visible.length === 0);
      });
    });
  }

  // Reserve location toggle
  const locBtns = document.querySelectorAll('.reserve-loc');
  locBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      locBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
