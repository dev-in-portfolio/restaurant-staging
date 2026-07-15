// === CRISPY BANH MI: Site JavaScript ===
(function(){
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(toggle && navLinks){
    toggle.addEventListener('click',()=>{
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded',String(open));
    });
  }

  // Menu category filter
  const filterBtns = document.querySelectorAll('.menu-controls button[data-filter]');
  const sections = document.querySelectorAll('.menu-section[data-category]');
  if(filterBtns.length && sections.length){
    filterBtns.forEach(btn=>{
      btn.addEventListener('click',()=>{
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        sections.forEach(s=>{
          if(cat==='all' || s.dataset.category===cat){
            s.classList.remove('hidden');
          } else {
            s.classList.add('hidden');
          }
        });
      });
    });
  }

  // Menu search
  const searchInput = document.getElementById('menu-search-input');
  const menuEmpty = document.getElementById('menu-empty');
  if(searchInput){
    searchInput.addEventListener('input',()=>{
      const q = searchInput.value.toLowerCase().trim();
      let anyVisible = false;
      document.querySelectorAll('.menu-row').forEach(row=>{
        const text = row.textContent.toLowerCase();
        const match = !q || text.includes(q);
        row.style.display = match ? '' : 'none';
        if(match) anyVisible = true;
      });
      if(q){
        sections.forEach(s=>s.classList.remove('hidden'));
        filterBtns.forEach(b=>b.classList.remove('active'));
      }
      if(menuEmpty) menuEmpty.hidden = anyVisible;
    });
  }

  // Location tab switcher
  const locTabs = document.querySelectorAll('.loc-tab');
  const locPanels = document.querySelectorAll('.loc-panel');
  if(locTabs.length && locPanels.length){
    locTabs.forEach(tab=>{
      tab.addEventListener('click',()=>{
        locTabs.forEach(t=>{t.classList.remove('active');t.setAttribute('aria-selected','false')});
        locPanels.forEach(p=>{p.classList.remove('active');p.hidden=true});
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        const panel = document.getElementById('panel-'+tab.dataset.loc);
        if(panel){panel.classList.add('active');panel.hidden=false}
      });
    });
  }

  // URL hash for locations
  const hash = window.location.hash.replace('#','');
  if(hash){
    const target = document.querySelector('.loc-tab[data-loc="'+hash+'"]');
    if(target) target.click();
  }
})();
