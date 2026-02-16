import { KeyboardConfig } from "../constants/KeyboardConfig";

const ENTRIES = Object.entries(KeyboardConfig);
const ALL_KEY_CODES = ENTRIES.map(([code]) => code);

const WHITE_KEYS = ENTRIES.filter(([, data]) => data.type === "white").map(
  ([code]) => code,
);

const BLACK_KEYS = ENTRIES.filter(([, data]) => data.type === "black").map(
  ([code]) => code,
);

const KEY_DATA = Object.fromEntries(ENTRIES);

const WHITE_INDEX = (() => {
  const map = {};
  let whitesSoFar = 0;

  for (const [code, data] of ENTRIES) {
    map[code] = whitesSoFar;
    if (data.type === "white") whitesSoFar += 1;
  }

  return map;
})();

export const getAllKeyCodes = () => ALL_KEY_CODES;

export const getWhiteKeys = () => WHITE_KEYS;

export const getBlackKeys = () => BLACK_KEYS;

export const getWhiteIndex = (keyCode) => WHITE_INDEX[keyCode] ?? 0;

export const getKeyData = (keyCode) => KEY_DATA[keyCode] ?? null;
