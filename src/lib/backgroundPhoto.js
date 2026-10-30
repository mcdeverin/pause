// My Photo storage. The image never leaves the device: it is downscaled in the
// WebView and kept in the app's own local storage — no upload, no account.
// On iOS the file picker opens the native photo library.

const STORAGE_KEY = "pauseBackgroundPhoto";
const MAX_SIDE = 1600;
const QUALITY = 0.82;
// Base64 runs ~4/3 of the byte size; this keeps us well inside the ~5MB budget.
const MAX_STORED_CHARS = 2400000;

let cache;

export function getStoredPhoto() {
  if (cache !== undefined) return cache;
  try {
    cache = localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    cache = null;
  }
  return cache;
}

// Returns false when the photo could not be written to storage (it stays usable
// for this run), so the caller can say so instead of silently losing it.
export function saveStoredPhoto(dataUrl) {
  cache = dataUrl;
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
    return true;
  } catch {
    return false;
  }
}

export function clearStoredPhoto() {
  cache = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
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