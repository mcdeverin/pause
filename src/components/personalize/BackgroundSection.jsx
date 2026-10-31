import { useState } from "react";
import { BACKGROUNDS, CUSTOM_COLOR_ID, CUSTOM_GRADIENT_ID, MY_PHOTO_ID } from "../../lib/design";
import {
  EMPTY_CATEGORY_COPY,
  NATURE_IMAGES,
  PLACES_IMAGES,
  SEASON_IMAGES,
  getGalleryCategory,
} from "../../lib/backgroundGallery";
import CategoryTabs from "./CategoryTabs";
import ColorBackgrounds from "./ColorBackgrounds";
import PhotoGallery from "./PhotoGallery";
import PhotoLibrary from "./PhotoLibrary";

// Which category a saved background belongs to, so reopening the panel lands on
// the collection the user last chose from.
function categoryFor(background) {
  const collection = getGalleryCategory(background);
  if (collection) return collection;
  if (background === MY_PHOTO_ID) return "photos";
  if (background === CUSTOM_COLOR_ID || background === CUSTOM_GRADIENT_ID) return "color";
  if (BACKGROUNDS.some((option) => option.id === background)) return "color";
  return "nature";
}

export default function BackgroundSection({
  draft,
  theme,
  onSelectBackground,
  onCustomColor,
  onGradientColors,
  photos = [],
  onSelectPhoto,
  onAddPhoto,
  onRemovePhoto,
  onPhotoZoom,
  isPro = false,
  addBlocked = false,
  onAddBlocked,
}) {
  const [category, setCategory] = useState(() => categoryFor(draft.background));

  return (
    <>
      <CategoryTabs theme={theme} value={category} onChange={setCategory} />

      <div style={{ marginTop: 12 }}>
        {category === "color" && (
          <ColorBackgrounds
            draft={draft}
            theme={theme}
            onSelectBackground={onSelectBackground}
            onCustomColor={onCustomColor}
            onGradientColors={onGradientColors}
            isPro={isPro}
          />
        )}

        {category === "photos" && (
          <PhotoLibrary
            theme={theme}
            photos={photos}
            selectedId={
              draft.background === MY_PHOTO_ID ? draft.photoId || (photos[0] && photos[0].id) : null
            }
            onSelect={onSelectPhoto}
            onAdd={onAddPhoto}
            onRemove={onRemovePhoto}
            zoom={draft.photoZoom}
            onZoomChange={onPhotoZoom}
            addBlocked={addBlocked}
            onAddBlocked={onAddBlocked}
          />
        )}

        {category === "nature" && (
          <PhotoGallery
            theme={theme}
            images={NATURE_IMAGES}
            value={draft.background}
            onSelect={onSelectBackground}
            emptyCopy={EMPTY_CATEGORY_COPY.nature}
            isPro={isPro}
          />
        )}

        {category === "places" && (
          <PhotoGallery
            theme={theme}
            images={PLACES_IMAGES}
            value={draft.background}
            onSelect={onSelectBackground}
            emptyCopy={EMPTY_CATEGORY_COPY.places}
            isPro={isPro}
          />
        )}

        {category === "seasons" && (
          <PhotoGallery
            theme={theme}
            images={SEASON_IMAGES}
            value={draft.background}
            onSelect={onSelectBackground}
            emptyCopy={EMPTY_CATEGORY_COPY.seasons}
            isPro={isPro}
          />
        )}
      </div>
    </>
  );
}