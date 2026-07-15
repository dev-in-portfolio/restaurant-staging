(() => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (toggle && links) toggle.addEventListener('click', () => { const open = links.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const dishes = [...document.querySelectorAll('[data-category]')];
  buttons.forEach(button => button.addEventListener('click', () => { const wanted = button.dataset.filter; buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button))); dishes.forEach(d => d.hidden = wanted !== 'all' && d.dataset.category !== wanted); }));
  const planner = document.querySelector('[data-planner]');
  if (planner) {
    const occasion = planner.querySelector('[data-occasion]'); const count = planner.querySelector('[data-count]'); const timing = planner.querySelector('[data-timing]');
    const title = planner.querySelector('[data-plan-title]'); const summary = planner.querySelector('[data-plan-summary]'); const list = planner.querySelector('[data-plan-list]');
    const plans = {
      'Feed the crew':['Pick one menu lane before everyone arrives','Choose a single point person for the table','Confirm the current menu and group seating directly'],
      'Birthday in NoDa':['Ask about current celebration policies','Build the evening around a clear arrival time','Keep the first round simple so the table can settle'],
      'Brunch meetup':['Confirm current brunch service first','Choose a meeting point on 36th Street','Plan for the neighborhood to be part of the outing'],
      'First stop, long night':['Use Boudreaux’s as the food anchor','Check parking or transit before leaving','Leave the next stop flexible']
    };
    const update = () => { const n = Math.max(1, Number(count.value) || 1); title.textContent = occasion.value; summary.textContent = `${n} ${n === 1 ? 'person' : 'people'} · ${timing.value.toLowerCase()}.`; list.innerHTML = plans[occasion.value].map(item => `<li>${item}</li>`).join(''); };
    [occasion,count,timing].forEach(el => el.addEventListener('input', update)); update();
  }
})();
