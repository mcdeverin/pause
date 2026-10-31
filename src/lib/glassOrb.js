// The iridescent glass orb ships as a PNG on a solid black backdrop. Rather than
// lay a black square on the user's chosen background, the black is turned into
// transparency once, in a canvas, and the result is reused everywhere.
const SOURCE =
  "https://media.base44.com/images/public/69ca3c28f8f30cee64e1f21c/c9baf9f1e_EtherealIridescentLiquidGlassOrb.png";

const MAX_SIZE = 768;

let pending = null;

function keyOutBlack(image) {
  const size = Math.min(MAX_SIZE, image.width || MAX_SIZE, image.height || MAX_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, size, size);

  const frame = context.getImageData(0, 0, size, size);
  const pixels = frame.data;
  // A pixel's brightness becomes its opacity, so the black backdrop disappears
  // and the glow fades out the way it does in the artwork.
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 3] = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
  }

  context.putImageData(frame, 0, 0);
  return canvas.toDataURL("image/png");
}

// One shared load for the whole app, however many places show the orb.
export default function loadGlassOrb() {
  if (pending) return pending;

  pending = new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        resolve(keyOutBlack(image));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = SOURCE;
  });

  return pending;
}