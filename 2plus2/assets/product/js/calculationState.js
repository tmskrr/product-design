export const calculationKey = ({ from, to, value }) => JSON.stringify([from, to, value]);

export function createCalculation(result, snapshot) {
  return { key: calculationKey(snapshot), result };
}

export function matchingResult(calculation, snapshot) {
  if (!calculation || calculation.key !== calculationKey(snapshot)) return null;
  return calculation.result;
}
