// Interacciones de demostración del panel del estudiante.
const menuToggle = document.querySelector('#student-menu-toggle');
const mainNav = document.querySelector('#student-main-nav');
menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('nav-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

const accountButton = document.querySelector('#account-button');
const accountMenu = document.querySelector('#account-menu');
accountButton?.addEventListener('click', () => {
  const open = accountMenu.hidden;
  accountMenu.hidden = !open;
  accountButton.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', (event) => {
  if (accountMenu && accountButton && !accountMenu.contains(event.target) && !accountButton.contains(event.target)) {
    accountMenu.hidden = true;
    accountButton.setAttribute('aria-expanded', 'false');
  }
});

const favoriteButtons = document.querySelectorAll('.favorite-toggle');
const favoriteCount = document.querySelector('#favorite-count');
const sidebarCount = document.querySelector('#sidebar-favorite-count');
const activityCount = document.querySelector('#activity-favorite-count');
const emptyState = document.querySelector('#favorites-empty');
const favoriteGrid = document.querySelector('#favorite-grid');
function updateFavorites() {
  const count = document.querySelectorAll('.favorite-toggle.is-favorite').length;
  [favoriteCount, sidebarCount, activityCount].forEach((el) => { if (el) el.textContent = count; });
  if (emptyState) emptyState.hidden = count !== 0;
  if (favoriteGrid) favoriteGrid.hidden = count === 0;
}
favoriteButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const active = button.classList.toggle('is-favorite');
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Quitar de favoritos' : 'Añadir a favoritos');
    button.textContent = active ? '♥' : '♡';
    updateFavorites();
  });
});
updateFavorites();
