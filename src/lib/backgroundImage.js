// Resolves the one photograph the saved background points at — either a curated
// collection image or one of the user's own device photos — so every screen paints
// the same full-screen picture.

import { MY_PHOTO_ID } from "./design";
import { getGalleryImage } from "./backgroundGallery";

export function resolveBackgroundImage(settings = {}, storedPhotos = []) {
  const { background, photoId } = settings;

  if (background === MY_PHOTO_ID) {
    const entry = storedPhotos.find((photo) => photo.id === photoId) || storedPhotos[0] || null;
    return entry ? entry.dataUrl : null;
  }

  const gallery = getGalleryImage(background);
  return gallery ? gallery.url : null;
}