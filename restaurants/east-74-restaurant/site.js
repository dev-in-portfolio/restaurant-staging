// ---- Mobile Nav Toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

// ---- Menu Category Filter ----
const filterPills = document.querySelectorAll('.filter-pill');
const menuItems = document.querySelectorAll('.menu-item');
const menuGrid = document.getElementById('menuGrid');
const menuSearch = document.getElementById('menuSearch');
const menuNote = document.getElementById('menuNote');
let activeCategory = 'all';
let searchTerm = '';

function filterMenu() {
  let visibleCount = 0;
  menuItems.forEach(item => {
    const itemCat = item.dataset.category;
    const itemName = (item.dataset.name || '').toLowerCase();
    const itemText = item.textContent.toLowerCase();
    const matchesCategory = activeCategory === 'all' || itemCat === activeCategory;
    const matchesSearch = searchTerm === '' || itemName.includes(searchTerm) || itemText.includes(searchTerm);
    const visible = matchesCategory && matchesSearch;
    item.classList.toggle('hidden', !visible);
    if (visible) visibleCount++;
  });

  const noResults = menuGrid.querySelector('.menu-no-results');
  if (noResults) noResults.remove();

  if (visibleCount === 0) {
    const msg = document.createElement('p');
    msg.className = 'menu-no-results';
    msg.textContent = 'No items match your search.';
    menuGrid.appendChild(msg);
  }

  if (menuNote) {
    menuNote.style.display = visibleCount === 0 ? 'none' : '';
  }
}

filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeCategory = pill.dataset.category;
    filterMenu();
  });
});

if (menuSearch) {
  menuSearch.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    filterMenu();
  });
}

// ---- Smooth Scroll ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight || 64;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
