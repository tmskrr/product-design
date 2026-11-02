const THEME_MODES = ['light', 'dark', 'auto'];
const THEME_LABELS = {
  ru: { light: 'светлая тема', dark: 'тёмная тема', auto: 'автоматическая тема' },
  en: { light: 'light theme', dark: 'dark theme', auto: 'automatic theme' },
};

export function syncThemeToggleLabel(locale = document.documentElement.lang) {
  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;
  const language = String(locale).toLowerCase().startsWith('ru') ? 'ru' : 'en';
  const mode = THEME_MODES.includes(toggle.dataset.themeMode) ? toggle.dataset.themeMode : 'auto';
  const label = THEME_LABELS[language][mode];
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
}

export function initTheme() {
  const root = document.documentElement;
  const logo = document.querySelector('.header__logo-image');
  const toggle = document.querySelector('#theme-toggle');
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function getSystemTheme() {
    return media.matches ? 'dark' : 'light';
  }

  function applyTheme(mode, { save = true } = {}) {
    const theme = THEME_MODES.includes(mode) ? mode : 'auto';
    const actualTheme = theme === 'auto' ? getSystemTheme() : theme;

    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${actualTheme}`);

    if (logo) logo.src = actualTheme === 'dark' ? './images/logo-light.svg?v=71eca9a71049' : './images/logo-dark.svg?v=71eca9a71049';
    if (toggle) toggle.dataset.themeMode = theme;
    if (save) localStorage.setItem('theme', theme);
    syncThemeToggleLabel();
  }

  const storedTheme = localStorage.getItem('theme');
  const savedTheme = THEME_MODES.includes(storedTheme) ? storedTheme : 'auto';
  applyTheme(savedTheme);

  toggle?.addEventListener('click', () => {
    const currentIndex = THEME_MODES.indexOf(toggle.dataset.themeMode);
    applyTheme(THEME_MODES[(currentIndex + 1) % THEME_MODES.length]);
  });

  const syncAutoTheme = () => {
    if ((localStorage.getItem('theme') || 'auto') === 'auto') applyTheme('auto', { save: false });
  };
  if (media.addEventListener) media.addEventListener('change', syncAutoTheme);
  else media.addListener(syncAutoTheme);
}
