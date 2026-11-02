export const translations = {
  en: {
    title: 'number systems converter', home: 'number systems converter home', language: 'interface language', theme: 'color theme',
    from: 'from', to: 'to', swapSystems: 'swap number systems', enterText: 'enter text', enterNumber: 'enter {system} number',
    enterBinaryBytes: 'enter binary bytes', enterOctalBytes: 'enter octal bytes', enterHexBytes: 'enter hexadecimal bytes', enterDecimalBytes: 'enter decimal bytes',
    binaryBytesHelper: '8 bits per byte, separated by spaces · example: 01001000 01101001 → Hi', octalBytesHelper: '3 digits per byte (000–377), separated by spaces · example: 110 151 → Hi',
    decimalBytesHelper: 'bytes from 0 to 255, separated by spaces · example: 72 105 → Hi', hexBytesHelper: '2 hex digits per byte, separated by spaces · example: 48 69 → Hi',
    reset: 'RESET', convert: 'CONVERT', swap: 'SWAP', result: 'result in the {system} system', approximateResult: 'approximate result in the {system} system', textResult: 'text result', value: 'text value',
    number: 'number in the {system} system', numberDigits: 'number in the {system} system ({count} {unit})', digit: 'digit', digitsFew: 'digits', digits: 'digits',
    grouping: 'group digits', formula: 'formula', binaryIntermediate: 'intermediate binary value',
    steps: 'conversion steps: {from} → {to}', calculation: 'calculation', decimalCalculationSteps: 'decimal calculation steps',
    decimalToBinaryCalculationSteps: 'decimal to binary calculation steps', decimalToOctalCalculationSteps: 'decimal to octal calculation steps',
    decimalToHexCalculationSteps: 'decimal to hexadecimal calculation steps', hexToDecimalCalculationSteps: 'hexadecimal to decimal calculation steps',
    littleEndian: 'little endian', bigEndian: 'big endian', address: 'address', data: 'data',
    results: 'conversion results', copyResult: 'copy result', copyNumber: 'copy number', copyLittleEndian: 'copy little endian data', copyBigEndian: 'copy big endian data',
    copyIntermediate: 'copy intermediate value', copyFormula: 'copy formula', copySteps: 'copy calculation steps', copied: 'copied', copyUnavailable: 'couldn’t copy',
    empty: 'enter a value', tooLong: 'value is too long (maximum {max} characters)', invalidBinary: 'use only 0, 1, and one decimal point',
    invalidOctal: 'use only digits 0–7 and one decimal point', invalidDecimal: 'use only digits 0–9 and one decimal point',
    invalidHexadecimal: 'use only digits 0–9, letters A–F, and one decimal point',
    invalidUtf8: 'these bytes are not valid UTF-8', unsupportedPair: 'this conversion is not available',
    invalidBinaryBytes: 'enter 8-bit binary bytes separated by spaces', invalidOctalBytes: 'enter 3-digit octal bytes from 000 to 377 separated by spaces', invalidHexBytes: 'enter 2-digit hexadecimal bytes separated by spaces',
    invalidDecimalBytes: 'enter decimal bytes from 0 to 255 separated by spaces', utf8Bytes: 'UTF-8 bytes', textPlaceholder: 'text',
    groupBits: 'group the binary digits in blocks of {size}', digitToBits: 'replace each source digit with {size} binary digits',
    positionalExpansion: 'positional expansion in base {base}', repeatingAsFraction: 'represent the repeating part as an exact fraction',
    divisionByBase: 'successive division by {base}', remainder: 'remainder', remaindersResult: 'read the remainders from bottom to top',
    fractionMultiplication: 'multiply the fractional remainder by {base}', stepsTruncated: 'the remaining division steps are omitted', digitCount: '({count} digits)',
    approximateNote: 'the displayed fractional result is approximate', viaBinary: 'convert through an intermediate binary representation',
    utf8Encoding: 'encode the text as UTF-8 bytes', utf8Decoding: 'decode the byte sequence as UTF-8',
    light: 'light', auto: 'auto', dark: 'dark', binary: 'binary', decimal: 'decimal', octal: 'octal', hexadecimal: 'hexadecimal', text: 'text',
    binaryForm: 'binary', decimalForm: 'decimal', octalForm: 'octal', hexadecimalForm: 'hexadecimal', textForm: 'text',
    binaryAdj: 'binary', decimalAdj: 'decimal', octalAdj: 'octal', hexadecimalAdj: 'hexadecimal',
    aboutService: 'about', privacy: 'privacy', telegramBot: 'tg-bot', serviceInformation: 'service information',
    metaDescription: 'a fast, accessible converter for binary, octal, decimal, hexadecimal, and text values',
    ogDescription: 'convert binary, octal, decimal, hexadecimal, and text values with calculation steps',
  },
  ru: {
    title: 'конвертер систем счисления', home: 'главная страница конвертера систем счисления', language: 'язык интерфейса', theme: 'цветовая тема',
    from: 'из', to: 'в', swapSystems: 'поменять системы счисления местами', enterText: 'введите текст', enterNumber: 'введите {system} число',
    enterBinaryBytes: 'введите двоичные байты', enterOctalBytes: 'введите восьмеричные байты', enterHexBytes: 'введите шестнадцатеричные байты', enterDecimalBytes: 'введите десятичные байты',
    binaryBytesHelper: 'по 8 бит через пробел · пример: 01001000 01101001 → Hi', octalBytesHelper: 'по 3 цифры от 000 до 377 через пробел · пример: 110 151 → Hi',
    decimalBytesHelper: 'байты от 0 до 255 через пробел · пример: 72 105 → Hi', hexBytesHelper: 'по 2 hex-цифры через пробел · пример: 48 69 → Hi',
    reset: 'СБРОСИТЬ', convert: 'ПЕРЕВЕСТИ', swap: 'ПОМЕНЯТЬ', result: 'результат в {system} системе', approximateResult: 'приближённый результат в {system} системе', textResult: 'результат в текстовой форме', value: 'текстовое значение',
    number: 'число в {system} системе', numberDigits: 'число в {system} системе ({count} {unit})', digit: 'цифра', digitsFew: 'цифры', digits: 'цифр',
    grouping: 'группировать цифры', formula: 'формула', binaryIntermediate: 'промежуточное двоичное значение',
    steps: 'шаги перевода: {from} → {to}', calculation: 'расчёт', decimalCalculationSteps: 'шаги расчёта в десятичной системе',
    decimalToBinaryCalculationSteps: 'шаги перевода из десятичной в двоичную', decimalToOctalCalculationSteps: 'шаги перевода из десятичной в восьмеричную',
    decimalToHexCalculationSteps: 'шаги перевода из десятичной в шестнадцатеричную', hexToDecimalCalculationSteps: 'шаги перевода из шестнадцатеричной в десятичную',
    littleEndian: 'little endian', bigEndian: 'big endian', address: 'адрес', data: 'данные',
    results: 'результаты перевода', copyResult: 'копировать результат', copyNumber: 'копировать число', copyLittleEndian: 'копировать данные little endian', copyBigEndian: 'копировать данные big endian',
    copyIntermediate: 'копировать промежуточное значение', copyFormula: 'копировать формулу', copySteps: 'копировать шаги расчёта', copied: 'скопировано', copyUnavailable: 'не удалось скопировать',
    empty: 'введите значение', tooLong: 'значение слишком длинное (максимум {max} символов)', invalidBinary: 'допустимы только 0, 1 и одна точка',
    invalidOctal: 'допустимы цифры 0–7 и одна точка', invalidDecimal: 'допустимы цифры 0–9 и одна точка',
    invalidHexadecimal: 'допустимы цифры 0–9, буквы A–F и одна точка',
    invalidUtf8: 'эти байты не образуют корректный UTF-8', unsupportedPair: 'это направление перевода недоступно',
    invalidBinaryBytes: 'введите 8-битные двоичные байты через пробел', invalidOctalBytes: 'введите трёхзначные восьмеричные байты от 000 до 377 через пробел', invalidHexBytes: 'введите двухзначные шестнадцатеричные байты через пробел',
    invalidDecimalBytes: 'введите десятичные байты от 0 до 255 через пробел', utf8Bytes: 'байты UTF-8', textPlaceholder: 'текст',
    groupBits: 'разделите двоичные цифры на группы по {size}', digitToBits: 'замените каждую исходную цифру на {size} двоичных цифры',
    positionalExpansion: 'позиционное разложение по степеням основания {base}', repeatingAsFraction: 'представим периодическую часть точной дробью',
    divisionByBase: 'последовательное деление на {base}', remainder: 'остаток', remaindersResult: 'остатки снизу вверх',
    fractionMultiplication: 'умножение дробного остатка на {base}', stepsTruncated: 'остальные шаги деления опущены', digitCount: '({count} цифр)',
    approximateNote: 'показанный дробный результат является приближённым', viaBinary: 'перевод через промежуточное двоичное представление',
    utf8Encoding: 'кодирование текста в байты UTF-8', utf8Decoding: 'декодирование последовательности байтов как UTF-8',
    light: 'светлая', auto: 'авто', dark: 'тёмная', binary: 'двоичная', decimal: 'десятичная', octal: 'восьмеричная', hexadecimal: 'шестнадцатеричная', text: 'текст',
    binaryForm: 'двоичной', decimalForm: 'десятичной', octalForm: 'восьмеричной', hexadecimalForm: 'шестнадцатеричной', textForm: 'текстовой',
    binaryAdj: 'двоичное', decimalAdj: 'десятичное', octalAdj: 'восьмеричное', hexadecimalAdj: 'шестнадцатеричное',
    aboutService: 'о сервисе', privacy: 'конфиденциальность', telegramBot: 'тг-бот', serviceInformation: 'информация о сервисе',
    metaDescription: 'быстрый и доступный конвертер двоичных, восьмеричных, десятичных, шестнадцатеричных и текстовых значений',
    ogDescription: 'перевод значений между системами счисления и текстом с шагами расчёта',
  },
};

export function t(locale, key, params = {}) {
  const template = translations[locale]?.[key] ?? translations.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));
}

export function systemKey(system) {
  return { '2': 'binary', '8': 'octal', '10': 'decimal', '16': 'hexadecimal', text: 'text' }[system];
}

export function systemName(locale, system) {
  return t(locale, systemKey(system));
}

export function systemForm(locale, system) {
  return t(locale, `${systemKey(system)}Form`);
}
