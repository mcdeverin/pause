// Background adjustment maths — dimming, blur and colour parsing.
// Shared by the personalization controls, the live preview and every screen that
// paints a background, so the numbers always mean the same thing.

import { CUSTOM_COLOR_ID, MY_PHOTO_ID } from "./design";

export const DIM_MAX = 70;
export const BLUR_MAX = 100;
export const PHOTO_ZOOM_MIN = 1;
export const PHOTO_ZOOM_MAX = 2;
export const PHOTO_OFFSET_LIMIT = 40;

const BLUR_MAX_PX = 24;

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

export function clampDim(value) {
  return clampNumber(value, 0, DIM_MAX, 0);
}

export function clampBlur(value) {
  return clampNumber(value, 0, BLUR_MAX, 0);
}

export function clampPhotoZoom(value) {
  return clampNumber(value, PHOTO_ZOOM_MIN, PHOTO_ZOOM_MAX, PHOTO_ZOOM_MIN);
}

export function clampPhotoOffset(value) {
  return clampNumber(value, -PHOTO_OFFSET_LIMIT, PHOTO_OFFSET_LIMIT, 0);
}

export function blurPixels(percent) {
  return Math.round((clampBlur(percent) / BLUR_MAX) * BLUR_MAX_PX * 10) / 10;
}

export function isCustomColor(id) {
  return id === CUSTOM_COLOR_ID;
}

export function isPhoto(id) {
  return id === MY_PHOTO_ID;
}

// Accepts "f0f", "F0F0F0" or "#f0f0f0" and returns a canonical #RRGGBB, or null
// when the text isn't a colour yet (so a half-typed value never jumps around).
export function sanitizeHex(input) {
  const raw = String(input || "").trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((digit) => digit + digit)
      .join("")
      .toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
  return null;
}