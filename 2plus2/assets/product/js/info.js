import { initTheme, syncThemeToggleLabel } from './theme.js?v=71eca9a71049';
import { t } from './i18n.js?v=71eca9a71049';

const copy = {
  ru: {
    back: '← вернуться к калькулятору', aboutTitle: 'о сервисе',
    aboutLead: '2+2 — калькулятор для перевода значений между двоичной, восьмеричной, десятичной и шестнадцатеричной системами счисления',
    aboutDetail: 'сервис показывает результат и шаги расчёта. вычисления выполняются прямо в браузере, регистрация не нужна',
    importantTitle: 'важно', importantLead: '2+2 — вспомогательный инструмент для перевода значений между системами счисления',
    importantCheck: 'перед использованием результата в учебных, рабочих или критичных задачах рекомендуется проверить расчёт самостоятельно или другим способом',
    importantLiability: 'сервис не гарантирует абсолютную безошибочность результатов и не несёт ответственности за решения, принятые только на основании расчётов 2+2',
    privacyTitle: 'конфиденциальность', privacyIntro: '2+2 не требует регистрации и не запрашивает имя, почту или другие персональные данные',
    privacyLocal: 'выбранный язык и тема интерфейса могут сохраняться локально в браузере через localStorage',
    privacyUrl: 'если используется ссылка на конкретный расчёт, исходное значение и выбранные системы счисления могут находиться в url. такая ссылка доступна тому, кому пользователь её передаст',
    privacyStorage: 'введённые значения не сохраняются в базе данных 2+2',
    privacyHosting: 'хостинг-провайдер может автоматически обрабатывать стандартные технические данные запроса, например ip-адрес, сведения о браузере и системные логи',
    notFoundTitle: 'ой, страница не найдена', reload: 'перезагрузить', calculator: 'к калькулятору',
    aboutDescription: 'о сервисе 2+2 и важных ограничениях калькулятора систем счисления',
    privacyDescription: 'как 2+2 обрабатывает настройки интерфейса, ссылки на расчёты и технические данные',
    notFoundDescription: 'страница не найдена — 2+2',
  },
  en: {
    back: '← back to the calculator', aboutTitle: 'about the service',
    aboutLead: '2+2 is a calculator for converting values between binary, octal, decimal, and hexadecimal number systems',
    aboutDetail: 'the service shows the result and calculation steps. calculations run directly in the browser, and no registration is required',
    importantTitle: 'important', importantLead: '2+2 is an auxiliary tool for converting values between number systems',
    importantCheck: 'before using a result for study, work, or critical tasks, check the calculation independently or by another method',
    importantLiability: 'the service does not guarantee completely error-free results and is not responsible for decisions based only on calculations from 2+2',
    privacyTitle: 'privacy', privacyIntro: '2+2 does not require registration or request a name, email address, or other personal data',
    privacyLocal: 'the selected interface language and theme may be stored locally in the browser through localStorage',
    privacyUrl: 'when a link to a specific calculation is used, the input value and selected number systems may appear in the url. anyone the user shares the link with can access that information',
    privacyStorage: 'entered values are not stored in a 2+2 database',
    privacyHosting: 'the hosting provider may automatically process standard technical request data, such as the ip address, browser information, and system logs',
    notFoundTitle: 'oops, page not found', reload: 'reload', calculator: 'to calculator',
    aboutDescription: 'about 2+2 and important limitations of the number systems calculator',
    privacyDescription: 'how 2+2 handles interface settings, calculation links, and technical request data',
    notFoundDescription: 'page not found — 2+2',
  },
};

const segmentMap = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
const savedLocale = localStorage.getItem('converter-language');
let locale = ['ru', 'en'].includes(savedLocale) ? savedLocale : (navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en');

function renderSegmentTime(value) {
  const fragment = document.createDocumentFragment();
  [...value].forEach((char) => {
    if (char === ':') {
      const colon = document.createElement('span');
      colon.className = 'segment-colon';
      colon.append(document.createElement('i'), document.createElement('i'));
      fragment.append(colon);
      return;
    }
    const digit = document.createElement('span');
    digit.className = 'segment-digit';
    const active = segmentMap[char] || '';
    for (const name of 'abcdefg') {
      const part = document.createElement('i');
      part.className = `segment segment--${name}${active.includes(name) ? ' is-active' : ''}`;
      digit.append(part);
    }
    fragment.append(digit);
  });
  document.querySelector('#clock-visual').replaceChildren(fragment);
}

function updateClock() {
  const now = new Date();
  const languageLocale = locale === 'ru' ? 'ru-RU' : 'en-US';
  const timeText = new Intl.DateTimeFormat(languageLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  const time = document.querySelector('#local-time');
  time.dateTime = now.toISOString();
  document.querySelector('#local-time-text').textContent = timeText;
  renderSegmentTime(timeText);
  const date = new Intl.DateTimeFormat(languageLocale, { day: '2-digit', month: 'short', year: 'numeric' }).format(now);
  document.querySelector('#local-date').textContent = locale === 'ru' ? date.replace(/\s*г\.$/, '') : date;
  document.querySelector('#local-zone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function applyLanguage(nextLocale, { save = false } = {}) {
  locale = nextLocale;
  if (save) localStorage.setItem('converter-language', locale);
  document.documentElement.lang = locale;
  const page = document.body.dataset.page;
  document.title = `${copy[locale][`${page}Title`]} — 2+2`;
  const description = copy[locale][`${page}Description`];
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('#home-link').setAttribute('aria-label', t(locale, 'home'));
  document.querySelector('#language-menu').setAttribute('aria-label', t(locale, 'language'));
  document.querySelector('#theme-menu').setAttribute('aria-label', t(locale, 'theme'));
  syncThemeToggleLabel(locale);
  document.querySelector('.footer').setAttribute('aria-label', t(locale, 'serviceInformation'));
  document.querySelector('#about-link').textContent = t(locale, 'aboutService');
  document.querySelector('#privacy-link').textContent = t(locale, 'privacy');
  document.querySelector('#bot-link').textContent = t(locale, 'telegramBot');
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = copy[locale][element.dataset.i18n]; });
  document.querySelectorAll('.language-button').forEach((button) => {
    const active = button.dataset.language === locale;
    button.classList.toggle('utility-button_active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateClock();
}

initTheme();
document.querySelectorAll('.language-button').forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.language, { save: true })));
applyLanguage(locale);
setInterval(updateClock, 1000);

document.querySelector('#reload-page')?.addEventListener('click', () => window.location.reload());
