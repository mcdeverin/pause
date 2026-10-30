// Your Photos storage. Images never leave the device: they are downscaled in the
// WebView and kept in the app's own local storage — no upload, no account.
// On iOS the file picker opens the native photo library.

const STORAGE_KEY = "pauseBackgroundPhotos";
const LEGACY_KEY = "pauseBackgroundPhoto";
export const MAX_PHOTOS = 4;
const MAX_SIDE = 1400;
const QUALITY = 0.8;
// Base64 runs ~4/3 of the byte size; this keeps the whole library inside the
// WebView's local storage budget.
const MAX_STORED_CHARS = 460000;

let cache;

function newId() {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function persist(photos) {
  cache = photos;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    return true;
  } catch {
    return false;
  }
}

export function getStoredPhotos() {
  if (cache) return cache;

  let photos = [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(raw)) {
      photos = raw.filter((entry) => entry && entry.id && typeof entry.dataUrl === "string");
    }
  } catch {
    photos = [];
  }

  // A photo saved by an earlier version becomes the first photo in the library.
  if (photos.length === 0) {
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        photos = [{ id: newId(), dataUrl: legacy }];
        localStorage.removeItem(LEGACY_KEY);
        persist(photos);
      }
    } catch {
      // Storage unavailable — nothing to restore.
    }
  }

  cache = photos;
  return photos;
}

// Adds a photo at the front of the library. `stored` is false when the device was
// short on space, so the caller can say so instead of losing it silently.
export function addStoredPhoto(dataUrl) {
  const entry = { id: newId(), dataUrl };
  const next = [entry, ...getStoredPhotos()].slice(0, MAX_PHOTOS);
  const stored = persist(next);
  return { photos: next, id: entry.id, stored };
}

export function removeStoredPhoto(id) {
  const next = getStoredPhotos().filter((entry) => entry.id !== id);
  persist(next);
  return next;
}

function encode(image) {
  const canvas = document.createElement("canvas");
  let side = MAX_SIDE;
  let quality = QUALITY;
  let dataUrl = "";

  // Shrink until the encoded photo comfortably fits local storage.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const scale = Math.min(1, side / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_STORED_CHARS) break;
    side = Math.round(side * 0.75);
    quality = Math.max(0.6, quality - 0.08);
  }

  return dataUrl;
}

// Reads, downscales and re-encodes the picked image.
export function preparePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No photo was chosen."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("That photo could not be read."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That photo could not be read."));
      image.onload = () => {
        try {
          resolve(encode(image));
        } catch {
          reject(new Error("That photo could not be prepared."));
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}