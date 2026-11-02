import { t } from '../i18n.js?v=71eca9a71049';

export const SYSTEMS = {
  '2': { base: 2, name: 'Binary', adjective: 'binary', placeholder: '101010', inputMode: 'decimal' },
  '8': { base: 8, name: 'Octal', adjective: 'octal', placeholder: '52', inputMode: 'decimal' },
  '10': { base: 10, name: 'Decimal', adjective: 'decimal', placeholder: '42', inputMode: 'decimal' },
  '16': { base: 16, name: 'Hexadecimal', adjective: 'hexadecimal', placeholder: '2A', inputMode: 'text' },
  text: { base: null, name: 'Text', adjective: 'text', placeholder: 'Hello', inputMode: 'text' },
};

const DIGITS = '0123456789ABCDEF';
const NUMERIC_PRESENTATION = {
  '2:8': { equation: false, outputs: ['8', '10'], grouping: true, stepsKey: 'calculation', endian: false },
  '2:10': { equation: true, outputs: ['10', '16'], grouping: true, stepsKey: 'decimalCalculationSteps', endian: false },
  '2:16': { equation: true, outputs: ['16', '10'], grouping: true, stepsKey: 'calculation', endian: false },
  '8:2': { equation: false, outputs: ['2', '10'], grouping: true, stepsKey: 'calculation', endian: false },
  '8:10': { equation: false, outputs: ['10', '16'], grouping: false, stepsKey: 'decimalCalculationSteps', endian: false },
  '8:16': { equation: false, outputs: ['16', '10'], grouping: true, stepsKey: 'calculation', endian: false },
  '10:2': { equation: true, outputs: ['2', '16'], grouping: true, stepsKey: 'decimalToBinaryCalculationSteps', endian: true },
  '10:8': { equation: false, outputs: ['8', '16'], grouping: false, stepsKey: 'decimalToOctalCalculationSteps', endian: false },
  '10:16': { equation: true, outputs: ['16', '2'], grouping: true, stepsKey: 'decimalToHexCalculationSteps', endian: true },
  '16:2': { equation: true, outputs: ['2', '10'], grouping: true, stepsKey: 'calculation', endian: false },
  '16:8': { equation: false, outputs: ['8', '10'], grouping: true, stepsKey: 'calculation', endian: false },
  '16:10': { equation: true, outputs: ['10', '2'], grouping: true, stepsKey: 'hexToDecimalCalculationSteps', endian: false },
};
export const getNumericPresentation = (from, to) => NUMERIC_PRESENTATION[`${from}:${to}`] || null;
const MAX_FRACTION_DIGITS = 24;
const MAX_STEP_ROWS = 64;
const MAX_STEP_INTEGER_DIGITS = 160;
export const MAX_INPUT_LENGTH = 4096;

const TARGET_ORDER = ['10', '2', '8', '16', 'text'];
const isKnownSystem = (system) => Object.hasOwn(SYSTEMS, system);

export const isSupportedPair = (from, to) => isKnownSystem(from) && isKnownSystem(to) && from !== to;
export const availableTargets = (from) => isKnownSystem(from)
  ? TARGET_ORDER.filter((to) => to !== from)
  : [];

const powBigInt = (base, exponent) => {
  let result = 1n;
  for (let i = 0; i < exponent; i += 1) result *= BigInt(base);
  return result;
};
const INVISIBLE_FORMATTING = /[\u00AD\u061C\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
const normalizeNumeric = (value) => value
  .replace(INVISIBLE_FORMATTING, '')
  .trim()
  .replace(/[\s_']/g, '')
  .replace(',', '.')
  .toUpperCase();

function parseByteInput(value, system, locale) {
  const trimmed = value.trim();
  const parts = trimmed ? trimmed.split(/\s+/) : [];
  const patterns = { '2': /^[01]{8}$/, '8': /^[0-3][0-7]{2}$/, '10': /^\d{1,3}$/, '16': /^[0-9A-Fa-f]{2}$/ };
  const errorKeys = { '2': 'invalidBinaryBytes', '8': 'invalidOctalBytes', '10': 'invalidDecimalBytes', '16': 'invalidHexBytes' };
  if (!parts.length || !patterns[system] || parts.some((part) => !patterns[system].test(part))) {
    return { valid: false, message: t(locale, errorKeys[system] || 'unsupportedPair') };
  }
  const bytes = parts.map((part) => Number.parseInt(part, Number(system)));
  if (bytes.some((byte) => byte < 0 || byte > 255)) return { valid: false, message: t(locale, errorKeys[system]) };
  return { valid: true, normalized: parts.join(' '), bytes };
}

export function validateInput(value, system, locale = 'en', toSystem = null) {
  if ([...value].length > MAX_INPUT_LENGTH) return { valid: false, message: t(locale, 'tooLong', { max: MAX_INPUT_LENGTH }) };
  if (system === 'text') return value.length ? { valid: true, normalized: value } : { valid: false, message: t(locale, 'empty') };
  if (!value.trim()) return { valid: false, message: t(locale, 'empty') };
  if (toSystem === 'text') return parseByteInput(value, system, locale);
  const normalized = normalizeNumeric(value);
  const patterns = {
    '2': /^[+-]?(?:[01]+(?:\.[01]*(?:\([01]+\))?)?|\.(?:[01]+(?:\([01]+\))?|\([01]+\)))$/,
    '8': /^[+-]?(?:[0-7]+(?:\.[0-7]*(?:\([0-7]+\))?)?|\.(?:[0-7]+(?:\([0-7]+\))?|\([0-7]+\)))$/,
    '10': /^[+-]?(?:\d+(?:\.\d*(?:\(\d+\))?)?|\.(?:\d+(?:\(\d+\))?|\(\d+\)))$/,
    '16': /^[+-]?(?:[0-9A-F]+(?:\.[0-9A-F]*(?:\([0-9A-F]+\))?)?|\.(?:[0-9A-F]+(?:\([0-9A-F]+\))?|\([0-9A-F]+\)))$/,
  };
  const invalidKeys = { '2': 'invalidBinary', '8': 'invalidOctal', '10': 'invalidDecimal', '16': 'invalidHexadecimal' };
  return patterns[system]?.test(normalized)
    ? { valid: true, normalized }
    : { valid: false, message: t(locale, invalidKeys[system] || 'unsupportedPair') };
}

function parseRational(value, base) {
  const negative = value.startsWith('-');
  const [integerPart = '0', fractionExpression = ''] = value.replace(/^[+-]/, '').split('.');
  const [, fractionPart = '', repeatingPart = ''] = fractionExpression.match(/^([^()]*)?(?:\(([^()]+)\))?$/) || [];
  let integer = 0n;
  for (const char of integerPart || '0') integer = integer * BigInt(base) + BigInt(DIGITS.indexOf(char));
  let fraction = 0n;
  for (const char of fractionPart) fraction = fraction * BigInt(base) + BigInt(DIGITS.indexOf(char));
  const finiteDenominator = powBigInt(base, fractionPart.length);
  let denominator = finiteDenominator;
  if (repeatingPart) {
    let repeating = 0n;
    for (const char of repeatingPart) repeating = repeating * BigInt(base) + BigInt(DIGITS.indexOf(char));
    const repeatingDenominator = powBigInt(base, repeatingPart.length) - 1n;
    fraction = fraction * repeatingDenominator + repeating;
    denominator *= repeatingDenominator;
  }
  const numerator = integer * denominator + fraction;
  return { numerator: negative ? -numerator : numerator, denominator };
}

function formatRational(rational, base, maxDigits = MAX_FRACTION_DIGITS) {
  const negative = rational.numerator < 0n;
  const numerator = negative ? -rational.numerator : rational.numerator;
  let remainder = numerator % rational.denominator;
  let value = (numerator / rational.denominator).toString(base).toUpperCase();
  let approximate = false;
  if (remainder !== 0n) {
    let fraction = '';
    const seen = new Map();
    for (let i = 0; i < maxDigits && remainder !== 0n; i += 1) {
      if (seen.has(remainder)) {
        const start = seen.get(remainder);
        fraction = `${fraction.slice(0, start)}(${fraction.slice(start)})`;
        remainder = 0n;
        break;
      }
      seen.set(remainder, i);
      remainder *= BigInt(base);
      const digit = remainder / rational.denominator;
      remainder %= rational.denominator;
      fraction += DIGITS[Number(digit)];
    }
    // A cycle may close exactly after the final permitted digit.
    if (remainder !== 0n && seen.has(remainder)) {
      const start = seen.get(remainder);
      fraction = `${fraction.slice(0, start)}(${fraction.slice(start)})`;
      remainder = 0n;
    }
    if (remainder !== 0n) approximate = true;
    value += `.${fraction}${approximate ? '…' : ''}`;
  }
  return { value: `${negative && numerator !== 0n ? '-' : ''}${value}`, approximate };
}

const textToBytes = (text) => [...new TextEncoder().encode(text)];
function decodeBytes(bytes, locale) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes)); }
  catch { throw new Error(t(locale, 'invalidUtf8')); }
}
function formatBytes(bytes, system) {
  if (system === '2') return bytes.map((byte) => byte.toString(2).padStart(8, '0')).join(' ');
  if (system === '8') return bytes.map((byte) => byte.toString(8).padStart(3, '0')).join(' ');
  if (system === '16') return bytes.map((byte) => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  return bytes.join(' ');
}

const digitValue = (char) => DIGITS.indexOf(char);
const superscript = (value) => {
  const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(value).split('').map((char) => map[char]).join('');
};
export const subscript = (value) => {
  const map = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  return String(value).split('').map((char) => map[char] || char).join('');
};
const relation = (approximate) => approximate ? '≈' : '=';
const equation = (input, fromBase, output, toBase, approximate = false) => `(${input})${subscript(fromBase)} ${relation(approximate)} (${output})${subscript(toBase)}`;

function buildPositionalSteps(input, fromBase, output, approximate, rational, locale) {
  if (input.includes('(')) {
    return `${t(locale, 'repeatingAsFraction')}\n(${input})${subscript(fromBase)} = ${rational.numerator}/${rational.denominator}\n${equation(input, fromBase, output, 10, approximate)}`;
  }
  const [integerPart = '0', fractionPart = ''] = input.replace(/^[+-]/, '').split('.');
  const terms = [...(integerPart || '0')].map((char, index) => `${digitValue(char)} × ${fromBase}${superscript(integerPart.length - index - 1)}`);
  terms.push(...[...fractionPart].map((char, index) => `${digitValue(char)} × ${fromBase}${superscript(-(index + 1))}`));
  const expansion = `${input.startsWith('-') ? '−(' : ''}${terms.join(' + ')}${input.startsWith('-') ? ')' : ''}`;
  return `${t(locale, 'positionalExpansion', { base: fromBase })}\n${expansion}\n${equation(input, fromBase, output, 10, approximate)}`;
}

function finiteParts(input) {
  const negative = input.startsWith('-');
  const [integer = '0', fraction = ''] = input.replace(/^[+-]/, '').split('.');
  return { negative, integer: integer || '0', fraction };
}

function formatStepInteger(value, locale) {
  const text = String(value);
  if (text.length <= MAX_STEP_INTEGER_DIGITS) return text;
  const edgeLength = Math.floor((MAX_STEP_INTEGER_DIGITS - 1) / 2);
  return `${text.slice(0, edgeLength)}…${text.slice(-edgeLength)} ${t(locale, 'digitCount', { count: text.length })}`;
}

function buildBinaryGroupingSteps(input, fromBase, toBase, output, approximate, locale) {
  if (input.includes('(')) return `${t(locale, 'groupBits', { size: toBase === 8 ? 3 : 4 })}\n${equation(input, fromBase, output, toBase, approximate)}`;
  const size = toBase === 8 ? 3 : 4;
  const { integer, fraction } = finiteParts(input);
  const paddedInteger = integer.padStart(Math.ceil(integer.length / size) * size, '0');
  const paddedFraction = fraction.padEnd(Math.ceil(fraction.length / size) * size, '0');
  const integerGroups = paddedInteger.match(new RegExp(`.{${size}}`, 'g')) || [];
  const fractionGroups = paddedFraction ? paddedFraction.match(new RegExp(`.{${size}}`, 'g')) || [] : [];
  const mappedInteger = integerGroups.map((group) => Number.parseInt(group, 2).toString(toBase).toUpperCase());
  const mappedFraction = fractionGroups.map((group) => Number.parseInt(group, 2).toString(toBase).toUpperCase());
  const sourceGroups = `${integerGroups.join(' ')}${fractionGroups.length ? ` . ${fractionGroups.join(' ')}` : ''}`;
  const targetGroups = `${mappedInteger.join(' ')}${mappedFraction.length ? ` . ${mappedFraction.join(' ')}` : ''}`;
  return `${t(locale, 'groupBits', { size })}\n${sourceGroups}\n${targetGroups}\n${equation(input, fromBase, output, toBase, approximate)}`;
}

function buildDigitsToBinarySteps(input, fromBase, output, approximate, locale) {
  if (input.includes('(')) return `${t(locale, 'digitToBits', { size: fromBase === 8 ? 3 : 4 })}\n${equation(input, fromBase, output, 2, approximate)}`;
  const size = fromBase === 8 ? 3 : 4;
  const { integer, fraction } = finiteParts(input);
  const mapDigits = (part) => [...part].map((char) => digitValue(char).toString(2).padStart(size, '0'));
  const source = `${[...integer].join(' ')}${fraction ? ` . ${[...fraction].join(' ')}` : ''}`;
  const mapped = `${mapDigits(integer).join(' ')}${fraction ? ` . ${mapDigits(fraction).join(' ')}` : ''}`;
  return `${t(locale, 'digitToBits', { size })}\n${source}\n${mapped}\n${equation(input, fromBase, output, 2, approximate)}`;
}

function buildDivisionSteps(rational, output, targetBase, approximate, locale) {
  const negative = rational.numerator < 0n;
  const numerator = negative ? -rational.numerator : rational.numerator;
  let integer = numerator / rational.denominator;
  let fraction = numerator % rational.denominator;
  const rows = [];
  let rowCount = 0;
  if (integer === 0n) rows.push(`0 ÷ ${targetBase} = 0, ${t(locale, 'remainder')} 0`);
  while (integer > 0n && rowCount < MAX_STEP_ROWS) {
    const quotient = integer / BigInt(targetBase);
    const remainderValue = integer % BigInt(targetBase);
    rows.push(`${formatStepInteger(integer, locale)} ÷ ${targetBase} = ${formatStepInteger(quotient, locale)}, ${t(locale, 'remainder')} ${DIGITS[Number(remainderValue)]}`);
    integer = quotient;
    rowCount += 1;
  }
  if (integer > 0n) rows.push(t(locale, 'stepsTruncated'));
  if (fraction !== 0n) {
    rows.push(t(locale, 'fractionMultiplication', { base: targetBase }));
    const seen = new Set();
    for (let index = 0; index < MAX_FRACTION_DIGITS && fraction !== 0n; index += 1) {
      if (seen.has(fraction)) break;
      seen.add(fraction);
      const before = fraction;
      fraction *= BigInt(targetBase);
      const digit = fraction / rational.denominator;
      fraction %= rational.denominator;
      rows.push(`${before}/${rational.denominator} × ${targetBase} → ${DIGITS[Number(digit)]}`);
    }
  }
  if (approximate) rows.push(t(locale, 'approximateNote'));
  return `${t(locale, 'divisionByBase', { base: targetBase })}\n${rows.join('\n')}\n${negative ? '−' : ''}${t(locale, 'remaindersResult')}: ${output}`;
}

function buildViaBinarySteps(input, fromBase, output, toBase, rational, approximate, locale) {
  const binary = formatRational(rational, 2);
  return {
    value: binary.value,
    approximate: binary.approximate,
    steps: `${t(locale, 'viaBinary')}\n${equation(input, fromBase, binary.value, 2, binary.approximate)}\n${equation(binary.value, 2, output, toBase, approximate)}`,
  };
}

function buildEndianData(rational, toSystem) {
  if (rational.denominator !== 1n || rational.numerator < 0n) return null;
  let hex = rational.numerator.toString(16).toUpperCase();
  if (hex.length % 2) hex = `0${hex}`;
  const bytes = hex.match(/.{2}/g) || ['00'];
  const formatByte = (byte) => toSystem === '2'
    ? Number.parseInt(byte, 16).toString(2).padStart(8, '0')
    : byte;
  const big = bytes.map(formatByte);
  return {
    addresses: bytes.map((_, index) => String(index)).join(' '),
    big: big.join(' '),
    little: [...big].reverse().join(' '),
    system: toSystem,
  };
}

function buildNumericResult(input, fromSystem, toSystem, rational, locale) {
  const formatted = formatRational(rational, Number(toSystem));
  let steps;
  if (fromSystem === '2' && ['8', '16'].includes(toSystem)) {
    steps = buildBinaryGroupingSteps(input, 2, Number(toSystem), formatted.value, formatted.approximate, locale);
  } else if (toSystem === '2' && ['8', '16'].includes(fromSystem)) {
    steps = buildDigitsToBinarySteps(input, Number(fromSystem), formatted.value, formatted.approximate, locale);
  } else if (toSystem === '10' && fromSystem !== '10') {
    steps = buildPositionalSteps(input, Number(fromSystem), formatted.value, formatted.approximate, rational, locale);
  } else if (fromSystem === '10') {
    steps = buildDivisionSteps(rational, formatted.value, Number(toSystem), formatted.approximate, locale);
  } else if (new Set([fromSystem, toSystem]).has('8') && new Set([fromSystem, toSystem]).has('16')) {
    const bridge = buildViaBinarySteps(input, Number(fromSystem), formatted.value, Number(toSystem), rational, formatted.approximate, locale);
    steps = bridge.steps;
  } else {
    steps = equation(input, Number(fromSystem), formatted.value, Number(toSystem), formatted.approximate);
  }
  const presentation = NUMERIC_PRESENTATION[`${fromSystem}:${toSystem}`];
  return {
    output: formatted.value,
    approximate: formatted.approximate,
    equation: presentation.equation
      ? equation(input, Number(fromSystem), formatted.value, Number(toSystem), formatted.approximate)
      : null,
    outputs: presentation.outputs.map((system) => {
      const formattedOutput = formatRational(rational, Number(system));
      return { system, value: formattedOutput.value, approximate: formattedOutput.approximate };
    }),
    presentation: { ...presentation },
    endian: presentation.endian ? buildEndianData(rational, toSystem) : null,
    steps,
  };
}

function buildTextEncodingSteps(text, bytes, toSystem, locale) {
  const rows = [...text].map((character) => {
    const characterBytes = textToBytes(character);
    return `${JSON.stringify(character)} → ${formatBytes(characterBytes, toSystem)}`;
  });
  return `${t(locale, 'utf8Encoding')}\n${rows.join('\n')}\n${t(locale, 'utf8Bytes')}: ${bytes.join(' ')}`;
}

export function convertValue(value, fromSystem, toSystem, locale = 'en') {
  if (!isSupportedPair(fromSystem, toSystem)) throw new Error(t(locale, 'unsupportedPair'));
  const validation = validateInput(value, fromSystem, locale, toSystem);
  if (!validation.valid) throw new Error(validation.message);

  if (fromSystem === 'text') {
    const bytes = textToBytes(value);
    const output = formatBytes(bytes, toSystem);
    return {
      output,
      approximate: false,
      equation: null,
      outputs: [{ system: toSystem, value: output, approximate: false }],
      presentation: null,
      endian: null,
      steps: buildTextEncodingSteps(value, bytes, toSystem, locale),
    };
  }

  if (toSystem === 'text') {
    const bytes = validation.bytes;
    const output = decodeBytes(bytes, locale);
    return {
      output,
      approximate: false,
      equation: null,
      outputs: [{ system: 'text', value: output, approximate: false }],
      presentation: null,
      endian: null,
      steps: `${t(locale, 'utf8Decoding')}\n${formatBytes(bytes, fromSystem)} → ${bytes.join(' ')}\n${t(locale, 'textResult')}: ${output}`,
    };
  }

  const input = validation.normalized;
  const rational = parseRational(input, Number(fromSystem));
  return buildNumericResult(input, fromSystem, toSystem, rational, locale);
}

function groupPart(value, size, fromEnd) {
  if (!value) return value;
  if (!fromEnd) return (value.match(new RegExp(`.{1,${size}}`, 'g')) || []).join(' ');
  const offset = value.length % size || size;
  return [value.slice(0, offset), ...(value.slice(offset).match(new RegExp(`.{1,${size}}`, 'g')) || [])].filter(Boolean).join(' ');
}

export function groupDigits(value, system) {
  if (system === 'text' || /\s/.test(value)) return value;
  const negative = value.startsWith('-') ? '-' : '';
  const [integer, fraction] = value.replace(/^-/, '').split('.');
  const size = ['2', '16'].includes(system) ? 4 : 3;
  const fractionMatch = fraction?.match(/^([^()]*)?(?:\(([^()]*)\))?(…)?$/);
  const finite = fractionMatch?.[1] ?? fraction?.replace('…', '') ?? '';
  const repeating = fractionMatch?.[2];
  const ellipsis = fractionMatch?.[3] || (fraction?.endsWith('…') ? '…' : '');
  const groupedFraction = `${groupPart(finite, size, false)}${repeating !== undefined ? `(${groupPart(repeating, size, false)})` : ''}${ellipsis}`;
  return `${negative}${groupPart(integer, size, true)}${fraction !== undefined ? `.${groupedFraction}` : ''}`;
}

export const countDigits = (value) => [...value.replace(/[-.\s()…]/g, '')].length;
