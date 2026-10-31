import { useEffect, useState } from "react";

// Overlay text has to know how light the chosen photograph actually is. The
// brightness is sampled once per image and cached, so switching between the same
// photo again needs no extra work.
const cache = new Map();

const SIZE = 16;

function toLinear(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function sampleLightness(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, SIZE, SIZE);
        const { data } = context.getImageData(0, 0, SIZE, SIZE);
        let total = 0;
        for (let index = 0; index < data.length; index += 4) {
          total +=
            0.2126 * toLinear(data[index]) +
            0.7152 * toLinear(data[index + 1]) +
            0.0722 * toLinear(data[index + 2]);
        }
        resolve(total / (data.length / 4));
      } catch {
        // An image that can't be read falls back to the dimming signal.
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

// Returns the photo's average lightness, 0 (black) to 1 (white), or null while
// it is still unknown.
export function usePhotoLightness(url) {
  const [lightness, setLightness] = useState(() =>
    url && cache.has(url) ? cache.get(url) : null
  );

  useEffect(() => {
    if (!url) {
      setLightness(null);
      return undefined;
    }
    if (cache.has(url)) {
      setLightness(cache.get(url));
      return undefined;
    }

    let active = true;
    setLightness(null);
    sampleLightness(url).then((value) => {
      if (value === null) return;
      cache.set(url, value);
      if (active) setLightness(value);
    });

    return () => {
      active = false;
    };
  }, [url]);

  return lightness;
}