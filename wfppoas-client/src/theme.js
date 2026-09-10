// Run before React renders so a saved dark theme does not flash light first.
const storageKey = 'wfppoas-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');
let memoryPreference = 'system';
export function getTheme() {
  try {
    const saved = localStorage.getItem(storageKey);
    return ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  } catch { return memoryPreference; }
}
function applyTheme() {
  const preference = getTheme();
  const dark = preference === 'dark' || (preference === 'system' && media.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}
export function setTheme(preference) {
  if (!['light', 'dark', 'system'].includes(preference)) return;
  memoryPreference = preference;
  try { localStorage.setItem(storageKey, preference); } catch { /* Storage may be disabled. */ }
  applyTheme();
  window.dispatchEvent(new Event('theme-changed'));
}
media.addEventListener('change', applyTheme);
window.addEventListener('storage', () => {
  applyTheme();
  window.dispatchEvent(new Event('theme-changed'));
});
applyTheme();
