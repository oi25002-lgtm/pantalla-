const catalogGrid = document.querySelector('#catalog-grid');
const catalogCards = [...document.querySelectorAll('.catalog-card')];
const catalogSearch = document.querySelector('#catalog-search');
const catalogSearchForm = document.querySelector('#catalog-search-form');
const catalogCheckboxes = [...document.querySelectorAll('.catalog-filters input[type="checkbox"]')];
const catalogCount = document.querySelector('#catalog-count');
const activeFilters = document.querySelector('#active-filters');
const noResults = document.querySelector('#no-results');
const sortSelect = document.querySelector('#sort-projects');

function yearMatches(card, selectedYears) {
  if (!selectedYears.length) return true;
  const year = Number(card.dataset.year);
  return selectedYears.some(range => {
    if (range === '2025-2026') return year >= 2025 && year <= 2026;
    if (range === '2021-2024') return year >= 2021 && year <= 2024;
    if (range === '2017-2020') return year >= 2017 && year <= 2020;
    if (range === '2016-older') return year <= 2016;
    return false;
  });
}

function updateActiveFilters() {
  activeFilters.replaceChildren();
  const checked = catalogCheckboxes.filter(input => input.checked);
  const query = catalogSearch.value.trim();
  const chips = checked.map(input => ({label: input.closest('label').querySelector('span').textContent, input}));
  if (query) chips.unshift({label: `Búsqueda: ${query}`, query: true});
  chips.forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'active-filter-chip';
    chip.append(document.createTextNode(item.label));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Quitar filtro ${item.label}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      if (item.query) catalogSearch.value = '';
      else item.input.checked = false;
      filterCatalog();
    });
    chip.append(remove);
    activeFilters.append(chip);
  });
  activeFilters.hidden = chips.length === 0;
}

function filterCatalog() {
  const query = catalogSearch.value.trim().toLocaleLowerCase('es');
  const areas = catalogCheckboxes.filter(input => input.checked && input.name === 'area').map(input => input.value);
  const years = catalogCheckboxes.filter(input => input.checked && input.name === 'year').map(input => input.value);
  const types = catalogCheckboxes.filter(input => input.checked && input.name === 'type').map(input => input.value);
  const availability = catalogCheckboxes.filter(input => input.checked && input.name === 'availability').map(input => input.value);
  let visibleCards = catalogCards.filter(card => {
    const searchable = `${card.dataset.search} ${card.dataset.title} ${card.dataset.area} ${card.dataset.type} ${card.dataset.year}`.toLocaleLowerCase('es');
    return (!query || searchable.includes(query)) &&
      (!areas.length || areas.includes(card.dataset.area)) &&
      yearMatches(card, years) &&
      (!types.length || types.includes(card.dataset.type)) &&
      (!availability.length || availability.includes(card.dataset.availability));
  });

  const sort = sortSelect.value;
  visibleCards.sort((a, b) => {
    if (sort === 'newest') return Number(b.dataset.year) - Number(a.dataset.year);
    if (sort === 'oldest') return Number(a.dataset.year) - Number(b.dataset.year);
    if (sort === 'title') return a.dataset.title.localeCompare(b.dataset.title, 'es');
    return catalogCards.indexOf(a) - catalogCards.indexOf(b);
  });
  visibleCards.forEach(card => catalogGrid.append(card));
  catalogCards.forEach(card => { card.hidden = !visibleCards.includes(card); });

  const total = visibleCards.length;
  catalogCount.innerHTML = `<strong>Mostrando ${total} ${total === 1 ? 'proyecto' : 'proyectos'}</strong><span>${query || areas.length || years.length || types.length || availability.length ? 'con los criterios seleccionados' : 'de ejemplo'}</span>`;
  noResults.hidden = total !== 0;
  updateActiveFilters();
}

catalogSearchForm.addEventListener('submit', event => {
  event.preventDefault();
  filterCatalog();
});
catalogSearch.addEventListener('input', filterCatalog);
catalogCheckboxes.forEach(input => input.addEventListener('change', filterCatalog));
sortSelect.addEventListener('change', filterCatalog);

document.querySelector('#reset-filters').addEventListener('click', resetCatalog);
document.querySelector('#reset-empty').addEventListener('click', resetCatalog);
function resetCatalog() {
  catalogSearch.value = '';
  catalogCheckboxes.forEach(input => { input.checked = false; });
  sortSelect.value = 'relevance';
  filterCatalog();
}

document.querySelectorAll('.search-hints button').forEach(button => {
  button.addEventListener('click', () => {
    catalogSearch.value = button.dataset.query;
    filterCatalog();
    catalogSearch.focus();
  });
});

document.querySelectorAll('.favorite-button').forEach(button => {
  button.addEventListener('click', () => {
    const isSaved = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!isSaved));
    button.textContent = isSaved ? '♡' : '♥';
    button.setAttribute('aria-label', isSaved ? 'Guardar en favoritos' : 'Quitar de favoritos');
  });
});

const viewButtons = [...document.querySelectorAll('.view-switch')];
viewButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    viewButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    catalogGrid.classList.toggle('list-view', index === 1);
  });
});

filterCatalog();
