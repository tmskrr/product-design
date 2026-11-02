import { convertValue, isSupportedPair } from './converters/engine.js?v=71eca9a71049';

export const DEFAULT_SHAREABLE_STATE = Object.freeze({ from: '2', to: '10', value: '' });

const systemToQuery = Object.freeze({
  '2': 'binary',
  '8': 'octal',
  '10': 'decimal',
  '16': 'hexadecimal',
  text: 'text',
});

const queryToSystem = Object.freeze(
  Object.fromEntries(Object.entries(systemToQuery).map(([system, name]) => [name, system])),
);

export function buildShareableSearch({ from, to, value }) {
  const params = new URLSearchParams();
  params.set('from', systemToQuery[from] || systemToQuery[DEFAULT_SHAREABLE_STATE.from]);
  params.set('to', systemToQuery[to] || systemToQuery[DEFAULT_SHAREABLE_STATE.to]);
  if (value !== undefined && value !== null && String(value).length) params.set('value', String(value));
  return params.toString();
}

export function readShareableState(search, locale = 'en') {
  const params = new URLSearchParams(search);
  const fromName = params.get('from');
  const toName = params.get('to');
  const value = params.get('value');
  const from = queryToSystem[fromName];
  const to = queryToSystem[toName];

  if (!from || !to || !isSupportedPair(from, to)) {
    return { ...DEFAULT_SHAREABLE_STATE, valid: false, result: null };
  }

  if (value === null || value === '') return { from, to, value: '', valid: true, result: null };

  try {
    const result = convertValue(value, from, to, locale);
    return { from, to, value, valid: true, result };
  } catch {
    return { ...DEFAULT_SHAREABLE_STATE, valid: false, result: null };
  }
}

export function replaceShareableUrl(state, locationObject = window.location, historyObject = window.history) {
  const search = buildShareableSearch(state);
  const nextUrl = `${locationObject.pathname}?${search}${locationObject.hash || ''}`;
  historyObject.replaceState(null, '', nextUrl);
}
