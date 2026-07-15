document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  // Location tabs
  const tabs = document.querySelectorAll('.loc-tab');
  const panels = document.querySelectorAll('.location-panel');
  if (tabs.length && panels.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.querySelector(`.location-panel[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // Menu filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const categories = document.querySelectorAll('.menu-category');
  const searchInput = document.getElementById('menu-search');
  const menuEmpty = document.querySelector('.menu-empty');
  let activeFilter = 'all';

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    categories.forEach(cat => {
      const catName = cat.dataset.category;
      const matchFilter = activeFilter === 'all' || catName === activeFilter;
      const items = cat.querySelectorAll('.menu-item');
      let catVisible = 0;

      items.forEach(item => {
        const name = item.querySelector('h4')?.textContent.toLowerCase() || '';
        const desc = item.querySelector('p')?.textContent.toLowerCase() || '';
        const matchSearch = !query || name.includes(query) || desc.includes(query);

        if (matchFilter && matchSearch) {
          item.style.display = '';
          catVisible++;
        } else {
          item.style.display = 'none';
        }
      });

      cat.style.display = matchFilter && catVisible > 0 ? '' : 'none';
      visibleCount += catVisible;
    });

    if (menuEmpty) {
      menuEmpty.style.display = visibleCount === 0 ? '' : 'none';
    }
  }

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

});
