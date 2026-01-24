import { KeyboardConfig } from "../constants/KeyboardConfig";

export const getAllKeyCodes = () => Object.keys(KeyboardConfig);

export const getWhiteKeys = () =>
  Object.entries(KeyboardConfig)
    .filter(([_, data]) => data.type === "white")
    .map(([code]) => code);

export const getBlackKeys = () =>
  Object.entries(KeyboardConfig)
    .filter(([_, data]) => data.type === "black")
    .map(([code]) => code);

export const getWhiteIndex = (keyCode) => {
  const entries = Object.entries(KeyboardConfig);
  const idx = entries.findIndex(([code]) => code === keyCode);
  if (idx === -1) return 0;

  return entries.slice(0, idx).filter(([_, data]) => data.type === "white")
    .length;
};

export const getKeyData = (keyCode) => {
  const entry = Object.entries(KeyboardConfig).find(
    ([code]) => code === keyCode
  );
  return entry ? entry[1] : null;
};
