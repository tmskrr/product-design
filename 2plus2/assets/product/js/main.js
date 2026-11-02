import { initTheme, syncThemeToggleLabel } from './theme.js?v=71eca9a71049';
import { SYSTEMS, availableTargets, convertValue, getNumericPresentation, groupDigits, validateInput } from './converters/engine.js?v=71eca9a71049';
import { systemForm, systemKey, systemName, t } from './i18n.js?v=71eca9a71049';
import { readShareableState, replaceShareableUrl } from './shareableUrl.js?v=71eca9a71049';
import { createCalculation, matchingResult } from './calculationState.js?v=71eca9a71049';

initTheme();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const form = $('#converter-form');
const fromSelect = $('#from-base');
const toSelect = $('#to-base');
const input = $('#number-input');
const inputWrapper = $('#input-wrapper');
const error = $('#input-error');
const grouping = $('#digit-grouping');
const results = $('#results');
const savedLocale = localStorage.getItem('converter-language');
let locale = ['ru', 'en'].includes(savedLocale) ? savedLocale : (navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en');
let currentCalculation = null;
let liveRecalculation = false;
let dropdowns = [];
const copyResetTimers = new Map();

const calculationSnapshot = () => ({ from: fromSelect.value, to: toSelect.value, value: input.value });
const getCurrentResult = () => matchingResult(currentCalculation, calculationSnapshot());

function syncShareableUrl({ includeValue = false } = {}) {
  replaceShareableUrl({
    from: fromSelect.value,
    to: toSelect.value,
    value: includeValue ? input.value : undefined,
  });
}

const segmentMap = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };

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
    const active = segmentMap[char] || '';
    const digit = document.createElement('span');
    digit.className = 'segment-digit';
    'abcdefg'.split('').forEach((segment) => {
      const part = document.createElement('i');
      part.className = `segment segment--${segment}${active.includes(segment) ? ' is-active' : ''}`;
      digit.append(part);
    });
    fragment.append(digit);
  });
  $('#clock-visual').replaceChildren(fragment);
}

function updateClock() {
  const now = new Date();
  const languageLocale = locale === 'ru' ? 'ru-RU' : 'en-US';
  const timeText = new Intl.DateTimeFormat(languageLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  const time = $('#local-time');
  time.dateTime = now.toISOString();
  $('#local-time-text').textContent = timeText;
  renderSegmentTime(timeText);
  const formattedDate = new Intl.DateTimeFormat(languageLocale, { day: '2-digit', month: 'short', year: 'numeric' }).format(now);
  $('#local-date').textContent = locale === 'ru' ? formattedDate.replace(/\s*г\.$/, '') : formattedDate;
  $('#local-zone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function setActionLabel(button, label) {
  const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.textContent = label;
}

function syncAvailableTargets(preferredTarget = toSelect.value) {
  const targets = availableTargets(fromSelect.value);
  const selectedTarget = targets.includes(preferredTarget) ? preferredTarget : targets[0];
  const options = targets.map((target) => {
    const option = document.createElement('option');
    option.value = target;
    option.textContent = systemName(locale, target);
    return option;
  });
  toSelect.replaceChildren(...options);
  toSelect.value = selectedTarget;
}

function updateSelectLabels() {
  [fromSelect, toSelect].forEach((select) => {
    [...select.options].forEach((option) => { option.textContent = systemName(locale, option.value); });
  });
  syncAvailableTargets();
  dropdowns.forEach((dropdown) => dropdown.render());
}

function closeDropdown(dropdown, { restoreFocus = false } = {}) {
  dropdown.wrapper.classList.remove('is-open');
  dropdown.trigger.setAttribute('aria-expanded', 'false');
  dropdown.trigger.removeAttribute('aria-activedescendant');
  if (restoreFocus) dropdown.trigger.focus();
}

function closeOtherDropdowns(current) {
  dropdowns.forEach((dropdown) => { if (dropdown !== current) closeDropdown(dropdown); });
}

function initDropdown(select) {
  const wrapper = select.closest('[data-dropdown]');
  const trigger = wrapper.querySelector('.dropdown__trigger');
  const value = wrapper.querySelector('.dropdown__value');
  const menu = wrapper.querySelector('.dropdown__menu');
  const dropdown = { select, wrapper, trigger, value, menu, activeIndex: select.selectedIndex };
  const availableIndexes = () => [...select.options]
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled && !option.hidden)
    .map(({ index }) => index);

  const setActive = (nativeIndex) => {
    const indexes = availableIndexes();
    if (!indexes.length) return;
    dropdown.activeIndex = indexes.includes(nativeIndex) ? nativeIndex : indexes[0];
    const options = [...menu.querySelectorAll('.dropdown__option')];
    options.forEach((option) => option.classList.toggle('is-active', Number(option.dataset.index) === dropdown.activeIndex));
    const active = options.find((option) => Number(option.dataset.index) === dropdown.activeIndex);
    if (active) {
      trigger.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    }
  };

  const moveActive = (movement) => {
    const indexes = availableIndexes();
    if (!indexes.length) return;
    const position = Math.max(0, indexes.indexOf(dropdown.activeIndex));
    setActive(indexes[(position + movement + indexes.length) % indexes.length]);
  };

  const selectActive = () => {
    const option = select.options[dropdown.activeIndex];
    if (!option || option.disabled || option.hidden) return;
    select.value = option.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    closeDropdown(dropdown, { restoreFocus: true });
  };

  const open = (movement = 0) => {
    closeOtherDropdowns(dropdown);
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.activeIndex = select.selectedIndex;
    if (movement) moveActive(movement);
    else setActive(dropdown.activeIndex);
  };

  dropdown.render = () => {
    value.textContent = select.options[select.selectedIndex]?.textContent || '';
    const buttons = [...select.options].map((nativeOption, index) => {
      if (nativeOption.disabled || nativeOption.hidden) return null;
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'dropdown__option';
      option.id = `${select.id}-option-${index}`;
      option.dataset.value = nativeOption.value;
      option.dataset.index = String(index);
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(nativeOption.selected));
      option.tabIndex = -1;
      const label = document.createElement('span');
      label.className = 'dropdown__option-label';
      label.textContent = nativeOption.textContent;
      option.append(label);
      option.addEventListener('pointerenter', () => setActive(index));
      option.addEventListener('click', () => { dropdown.activeIndex = index; selectActive(); });
      return option;
    }).filter(Boolean);
    menu.replaceChildren(...buttons);
    dropdown.activeIndex = select.selectedIndex;
    if (wrapper.classList.contains('is-open')) setActive(dropdown.activeIndex);
  };

  trigger.addEventListener('click', () => {
    if (wrapper.classList.contains('is-open')) closeDropdown(dropdown);
    else open();
  });
  trigger.addEventListener('keydown', (event) => {
    const isOpen = wrapper.classList.contains('is-open');
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) open(event.key === 'ArrowDown' ? 0 : -1);
      else moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (!isOpen) open();
      const indexes = availableIndexes();
      setActive(event.key === 'Home' ? indexes[0] : indexes[indexes.length - 1]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) selectActive();
      else open();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeDropdown(dropdown, { restoreFocus: true });
    } else if (event.key === 'Tab' && isOpen) {
      closeDropdown(dropdown);
    }
  });
  select.addEventListener('change', dropdown.render);
  dropdown.render();
  return dropdown;
}

function updateCopyLabels() {
  const labels = { 'result-formula': 'copyResult', 'result-steps': 'copySteps', 'little-endian-data': 'copyLittleEndian', 'big-endian-data': 'copyBigEndian' };
  $$('[data-copy]').forEach((button) => {
    const labelKey = button.dataset.copied === 'true' ? 'copied' : (button.dataset.copyLabel || labels[button.dataset.copy]);
    button.setAttribute('aria-label', t(locale, labelKey));
  });
}

function applyLanguage(nextLocale, { save = false } = {}) {
  locale = nextLocale;
  if (save) localStorage.setItem('converter-language', locale);
  document.documentElement.lang = locale;
  document.title = t(locale, 'title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t(locale, 'metaDescription'));
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', t(locale, 'title'));
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', t(locale, 'ogDescription'));
  $('#home-link').setAttribute('aria-label', t(locale, 'home'));
  $('#language-menu').setAttribute('aria-label', t(locale, 'language'));
  $('#theme-menu').setAttribute('aria-label', t(locale, 'theme'));
  syncThemeToggleLabel(locale);
  $('.footer').setAttribute('aria-label', t(locale, 'serviceInformation'));
  $('#about-link').textContent = t(locale, 'aboutService');
  $('#privacy-link').textContent = t(locale, 'privacy');
  $('#bot-link').textContent = t(locale, 'telegramBot');
  $('#from-label').textContent = t(locale, 'from');
  $('#to-label').textContent = t(locale, 'to');
  $('#swap-top-btn').setAttribute('aria-label', t(locale, 'swapSystems'));
  results.setAttribute('aria-label', t(locale, 'results'));
  setActionLabel($('#reset-btn'), t(locale, 'reset'));
  setActionLabel($('#convert-btn'), t(locale, 'convert'));
  $$('.language-button').forEach((button) => {
    const active = button.dataset.language === locale;
    button.classList.toggle('utility-button_active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateSelectLabels();
  updateFormCopy({ clear: false });
  grouping.closest('label').querySelector('.converter__text').textContent = t(locale, 'grouping');
  $('#little-endian-label').textContent = t(locale, 'littleEndian');
  $('#big-endian-label').textContent = t(locale, 'bigEndian');
  $('#little-address-label').textContent = t(locale, 'address');
  $('#big-address-label').textContent = t(locale, 'address');
  $('#little-data-label').textContent = t(locale, 'data');
  $('#big-data-label').textContent = t(locale, 'data');
  updateCopyLabels();
  const currentResult = getCurrentResult();
  if (currentResult) currentCalculation = createCalculation(convertValue(input.value, fromSelect.value, toSelect.value, locale), calculationSnapshot());
  renderResult();
  if (input.hasAttribute('aria-invalid')) {
    try { convertValue(input.value, fromSelect.value, toSelect.value, locale); clearError(); }
    catch (languageError) { setError(languageError.message); }
  }
  updateClock();
}

function setBaseValue(id, value) {
  $(`#${id} .converter__base-value`).textContent = value;
}

function updateFormCopy({ clear = true } = {}) {
  const source = SYSTEMS[fromSelect.value];
  const key = systemKey(fromSelect.value);
  const byteLabels = { '2': 'enterBinaryBytes', '8': 'enterOctalBytes', '10': 'enterDecimalBytes', '16': 'enterHexBytes' };
  const byteHelpers = { '2': 'binaryBytesHelper', '8': 'octalBytesHelper', '10': 'decimalBytesHelper', '16': 'hexBytesHelper' };
  const bytePlaceholders = { '2': '01001000 01101001', '8': '110 151', '10': '72 105', '16': '48 69' };
  const helper = $('#input-helper');
  if (toSelect.value === 'text') {
    $('#input-label').textContent = t(locale, byteLabels[fromSelect.value]);
    helper.textContent = t(locale, byteHelpers[fromSelect.value]);
    helper.hidden = false;
    input.placeholder = bytePlaceholders[fromSelect.value];
  } else {
    $('#input-label').textContent = source.base ? t(locale, 'enterNumber', { system: t(locale, `${key}Adj`) }) : t(locale, 'enterText');
    helper.textContent = '';
    helper.hidden = true;
    input.placeholder = fromSelect.value === 'text' ? t(locale, 'textPlaceholder') : source.placeholder;
  }
  setBaseValue('input-base', source.base || 'TXT');
  input.setAttribute('inputmode', source.inputMode);
  $('#input-base').classList.toggle('converter__base--text', fromSelect.value === 'text');
  if (clear) { clearError(); currentCalculation = null; }
  renderResult();
}

function setError(message, { focus = true } = {}) {
  inputWrapper.classList.add('converter__input--error');
  input.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  if (focus) input.focus();
}

function clearError() {
  inputWrapper.classList.remove('converter__input--error');
  input.removeAttribute('aria-invalid');
  error.textContent = '';
}

const displayed = (value, system) => grouping.checked ? groupDigits(value, system) : value;
function setOutput(id, value) {
  const element = $(`#${id} .converter__result-text`);
  element.textContent = value || '';
  element.title = value || '';
}

function renderOutputBlocks(systems, values = []) {
  const container = $('#output-blocks');
  const fragment = document.createDocumentFragment();
  systems.forEach((system, index) => {
    const value = values[index];
    const block = document.createElement('div');
    block.className = 'converter__block';
    block.id = `output-block-${index}`;

    const label = document.createElement('p');
    label.className = 'converter__text';
    label.id = `output-label-${index}`;
    label.textContent = t(locale, system === 'text' ? 'textResult' : 'number', { system: systemForm(locale, system) });

    const row = document.createElement('div');
    row.className = 'converter__result-row';
    const shell = document.createElement('div');
    shell.className = 'converter__field converter__result-shell';
    const result = document.createElement('div');
    result.className = 'converter__result';
    result.id = `output-${index}`;
    result.dataset.system = system;
    const resultText = document.createElement('span');
    resultText.className = 'converter__result-text';
    const renderedValue = value ? `${value.approximate ? '≈ ' : ''}${displayed(value.value, system)}` : '';
    resultText.textContent = renderedValue;
    resultText.title = renderedValue;
    result.append(resultText);

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'icon-btn';
    copy.dataset.copy = result.id;
    copy.dataset.copyLabel = system === 'text' ? 'copyResult' : 'copyNumber';
    copy.disabled = !renderedValue.length;
    const copyIcon = document.createElement('span');
    copyIcon.className = 'copy-icon';
    copyIcon.setAttribute('aria-hidden', 'true');
    copy.append(copyIcon);
    shell.append(result, copy);

    const base = document.createElement('span');
    base.className = `converter__base${system === 'text' ? ' converter__base--text' : ''}`;
    const baseValue = document.createElement('span');
    baseValue.className = 'converter__base-value';
    baseValue.textContent = SYSTEMS[system].base || 'TXT';
    base.append(baseValue);
    row.append(shell, base);
    block.append(label, row);
    fragment.append(block);
  });
  container.replaceChildren(fragment);
  updateCopyLabels();
}

function copyTextFor(button) {
  const target = document.getElementById(button.dataset.copy);
  const text = target.querySelector('.converter__result-text')?.textContent ?? target.textContent;
  return target.dataset.system === 'text' ? text : text.trim();
}

function clearCalculatedState() {
  currentCalculation = null;
  results.classList.remove('results--ready');
  ['result-formula', 'little-endian-data', 'big-endian-data'].forEach((id) => setOutput(id, ''));
  $$('#output-blocks .converter__result-text').forEach((element) => { element.textContent = ''; element.title = ''; });
  $('#little-endian-address').textContent = '';
  $('#big-endian-address').textContent = '';
  const steps = $('#result-steps');
  steps.textContent = '';
  steps.title = '';
  $$('[data-copy]').forEach((button) => {
    const timer = copyResetTimers.get(button);
    if (timer) window.clearTimeout(timer);
    copyResetTimers.delete(button);
    button.disabled = true;
    button.dataset.copied = 'false';
    button.classList.remove('icon-btn--copied');
  });
  updateCopyLabels();
}

function invalidateCalculation({ validateForCurrentSource = false } = {}) {
  clearCalculatedState();
  clearError();
  if (validateForCurrentSource && input.value.length) {
    const validation = validateInput(input.value, fromSelect.value, locale, toSelect.value);
    if (!validation.valid) setError(validation.message, { focus: false });
  }
}

function renderResult() {
  const targetName = systemName(locale, toSelect.value);
  const targetForm = systemForm(locale, toSelect.value);
  const presentation = getNumericPresentation(fromSelect.value, toSelect.value);
  const stepsKey = presentation?.stepsKey || 'steps';
  $('#steps-label').textContent = t(locale, stepsKey, { from: systemName(locale, fromSelect.value), to: targetName });
  const currentResult = getCurrentResult();
  const formulaBlock = $('#formula-block');
  const groupingOption = grouping.closest('label');
  groupingOption.hidden = !presentation?.grouping;
  const outputSystems = presentation?.outputs || [toSelect.value];
  if (!currentResult) {
    $('#formula-label').textContent = t(locale, 'result', { system: targetForm });
    clearCalculatedState();
    formulaBlock.hidden = !presentation?.equation;
    $('#endian-block').hidden = !presentation?.endian;
    renderOutputBlocks(outputSystems);
    return;
  }

  $('#formula-label').textContent = t(locale, currentResult.approximate ? 'approximateResult' : 'result', { system: targetForm });
  formulaBlock.hidden = !presentation?.equation;
  setOutput('result-formula', currentResult.equation || '');
  renderOutputBlocks(outputSystems, currentResult.outputs || []);

  const endianBlock = $('#endian-block');
  endianBlock.hidden = !currentResult.endian;
  if (currentResult.endian) {
    $('#little-endian-address').textContent = currentResult.endian.addresses;
    $('#big-endian-address').textContent = currentResult.endian.addresses;
    setOutput('little-endian-data', currentResult.endian.little);
    setOutput('big-endian-data', currentResult.endian.big);
  } else {
    $('#little-endian-address').textContent = '';
    $('#big-endian-address').textContent = '';
    setOutput('little-endian-data', '');
    setOutput('big-endian-data', '');
  }

  $('#result-steps').textContent = currentResult.steps;
  $$('[data-copy]').forEach((button) => {
    const block = button.closest('.converter__block');
    const text = copyTextFor(button);
    button.disabled = Boolean(block?.hidden) || !text.length;
  });
  results.classList.add('results--ready');
}

function convert({ enableLiveMode = true, focusOnError = true } = {}) {
  clearError();
  try {
    const result = convertValue(input.value, fromSelect.value, toSelect.value, locale);
    currentCalculation = createCalculation(result, calculationSnapshot());
    if (enableLiveMode) liveRecalculation = true;
    syncShareableUrl({ includeValue: true });
    renderResult();
  } catch (conversionError) {
    clearCalculatedState();
    setError(conversionError.message, { focus: focusOnError });
  }
}

function swap() {
  const currentResult = getCurrentResult();
  liveRecalculation = false;
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  syncAvailableTargets(previousFrom);
  dropdowns.forEach((dropdown) => dropdown.render());
  input.value = currentResult && !currentResult.approximate ? currentResult.output : '';
  updateFormCopy({ clear: false });
  invalidateCalculation({ validateForCurrentSource: true });
  syncShareableUrl();
}

function reset() {
  liveRecalculation = false;
  currentCalculation = null;
  input.value = '';
  updateFormCopy({ clear: false });
  invalidateCalculation();
  syncShareableUrl();
}

async function copyResult(button) {
  const labels = { 'result-formula': 'copyResult', 'result-steps': 'copySteps', 'little-endian-data': 'copyLittleEndian', 'big-endian-data': 'copyBigEndian' };
  const text = copyTextFor(button);
  if (!text.length) return;
  await navigator.clipboard.writeText(text);
  button.dataset.copied = 'true';
  button.classList.add('icon-btn--copied');
  button.setAttribute('aria-label', t(locale, 'copied'));
  const previousTimer = copyResetTimers.get(button);
  if (previousTimer) window.clearTimeout(previousTimer);
  const timer = window.setTimeout(() => {
    button.dataset.copied = 'false';
    button.classList.remove('icon-btn--copied');
    button.setAttribute('aria-label', t(locale, button.dataset.copyLabel || labels[button.dataset.copy]));
    copyResetTimers.delete(button);
  }, 1200);
  copyResetTimers.set(button, timer);
}

form.addEventListener('submit', (event) => { event.preventDefault(); convert(); });
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    convert();
  }
});
$('#reset-btn').addEventListener('click', reset);
$('#swap-top-btn').addEventListener('click', swap);
fromSelect.addEventListener('change', () => {
  liveRecalculation = false;
  syncAvailableTargets();
  dropdowns.forEach((dropdown) => dropdown.render());
  input.value = '';
  updateFormCopy({ clear: false });
  invalidateCalculation();
  syncShareableUrl();
});
toSelect.addEventListener('change', () => {
  liveRecalculation = false;
  input.value = '';
  updateFormCopy({ clear: false });
  invalidateCalculation();
  renderResult();
  syncShareableUrl();
});
grouping.addEventListener('change', renderResult);
function handleInputMutation() {
  if (liveRecalculation) {
    convert({ enableLiveMode: false, focusOnError: false });
  } else {
    invalidateCalculation();
    renderResult();
  }
}
input.addEventListener('input', handleInputMutation);
input.addEventListener('change', handleInputMutation);
input.addEventListener('focus', renderResult);
input.addEventListener('blur', renderResult);
const initialShareableState = readShareableState(window.location.search, locale);
fromSelect.value = initialShareableState.from;
syncAvailableTargets(initialShareableState.to);
input.value = initialShareableState.value;
currentCalculation = initialShareableState.result ? createCalculation(initialShareableState.result, calculationSnapshot()) : null;
dropdowns = [initDropdown(fromSelect), initDropdown(toSelect)];
$$('.language-button').forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.language, { save: true })));
document.addEventListener('click', (event) => {
  dropdowns.forEach((dropdown) => { if (!dropdown.wrapper.contains(event.target)) closeDropdown(dropdown); });
  const button = event.target.closest('[data-copy]');
  if (button) copyResult(button).catch(() => { error.textContent = t(locale, 'copyUnavailable'); });
});

applyLanguage(locale);
updateClock();
window.setInterval(updateClock, 1000);
window.addEventListener('pageshow', renderResult);
