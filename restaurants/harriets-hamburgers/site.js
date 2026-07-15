// Harriet's Hamburgers — site.js

document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
        });

        // Close nav on link click
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
            });
        });
    }

    // Menu category filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCategories = document.querySelectorAll('.menu-category');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            menuCategories.forEach(cat => {
                if (category === 'all' || cat.dataset.category === category) {
                    cat.style.display = '';
                } else {
                    cat.style.display = 'none';
                }
            });
        });
    });

    // Menu search
    const menuSearch = document.getElementById('menuSearch');

    if (menuSearch) {
        menuSearch.addEventListener('input', () => {
            const query = menuSearch.value.toLowerCase().trim();
            const items = document.querySelectorAll('.menu-item');

            // If searching, show all categories first
            if (query) {
                filterBtns.forEach(b => b.classList.remove('active'));
                filterBtns[0].classList.add('active');
                menuCategories.forEach(cat => { cat.style.display = ''; });
            }

            items.forEach(item => {
                const name = (item.dataset.name || '').toLowerCase();
                const text = item.textContent.toLowerCase();
                if (!query || name.includes(query) || text.includes(query)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });

            // Hide empty categories
            if (query) {
                menuCategories.forEach(cat => {
                    const visibleItems = cat.querySelectorAll('.menu-item:not(.hidden)');
                    cat.style.display = visibleItems.length ? '' : 'none';
                });
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
