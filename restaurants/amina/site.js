(() => {
  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      mainNav.classList.toggle('open');
    });
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mainNav.classList.remove('open');
      });
    });
  }

  // Menu filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const categories = document.querySelectorAll('.menu-category');
  if (filterBtns.length && categories.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        categories.forEach(cat => {
          cat.style.display = (filter === 'all' || cat.dataset.category === filter) ? '' : 'none';
        });
        document.getElementById('menuSearch').value = '';
      });
    });
  }

  // Menu search
  const searchInput = document.getElementById('menuSearch');
  const noResults = document.getElementById('menuNoResults');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      if (q) {
        filterBtns.forEach(b => b.classList.remove('active'));
        filterBtns[0].classList.add('active');
      }
      let visible = 0;
      categories.forEach(cat => {
        cat.style.display = '';
        const items = cat.querySelectorAll('.menu-item');
        items.forEach(item => {
          const match = item.dataset.name.toLowerCase().includes(q) ||
                        item.textContent.toLowerCase().includes(q);
          item.style.display = match ? '' : 'none';
          if (match) visible++;
        });
        const allHidden = Array.from(items).every(i => i.style.display === 'none');
        cat.style.display = allHidden ? 'none' : '';
      });
      if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
    });
  }

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
})();
