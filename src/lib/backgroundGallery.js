// Curated background photography. Only real, licensed photographs belong in these
// lists — nothing is generated or substituted. Until a collection is populated it
// renders a clean empty state instead of placeholder imagery.
//
// Each image: { id, label, url, tone } where `tone` is an optional css background
// used behind the photo while it loads.
//
// The files themselves live in the app's own public asset storage, so a saved
// choice keeps working after the app is reopened.

export const BACKGROUND_CATEGORIES = [
  { id: "nature", label: "Nature" },
  { id: "places", label: "Places" },
  { id: "seasons", label: "Seasons" },
  { id: "color", label: "Color" },
  { id: "photos", label: "Your Photos" },
];

const ASSET_ROOT = "https://media.base44.com/images/public/69ca3c28f8f30cee64e1f21c";

export const NATURE_IMAGES = [
  {
    id: "nature-mountain-lake",
    label: "Mountain Lake",
    url: `${ASSET_ROOT}/1b9448622_daniel-sessler-JtAuCe5hyhc-unsplash.jpg`,
    tone: "#4A5B63",
  },
  {
    id: "nature-two-chickens",
    label: "Two Chickens",
    url: `${ASSET_ROOT}/4731caf3d_grace-anne-bobadilla-ndEv7gmzico-unsplash.jpg`,
    tone: "#6B6152",
  },
  {
    id: "nature-dune-at-dusk",
    label: "Dune at Dusk",
    url: `${ASSET_ROOT}/7c2366f6d_jack-stapleton-oHPejFcODso-unsplash.jpg`,
    tone: "#C8A98B",
  },
  {
    id: "nature-under-the-stars",
    label: "Under the Stars",
    url: `${ASSET_ROOT}/e7ec49bce_leo_visions-AHhM44IB2_Y-unsplash.jpg`,
    tone: "#2A2E33",
  },
  {
    id: "nature-wild-horses",
    label: "Wild Horses",
    url: `${ASSET_ROOT}/196c6be42_martin-bennie-KFoWP--u8gY-unsplash.jpg`,
    tone: "#C0A160",
  },
  {
    id: "nature-still-water",
    label: "Still Water",
    url: `${ASSET_ROOT}/63129027e_tom-swinnen-LgSUmtCL07w-unsplash.jpg`,
    tone: "#354551",
  },
  {
    id: "nature-summer-grasses",
    label: "Summer Grasses",
    url: `${ASSET_ROOT}/2e5d76d22_uran-wang-UgtZH7VAxRA-unsplash.jpg`,
    tone: "#8FB0BE",
  },
];

export const PLACES_IMAGES = [
  {
    id: "places-golden-cliffs",
    label: "Golden Cliffs",
    url: `${ASSET_ROOT}/f284307c7_vincent-yap-55o6N9bVen0-unsplash.jpg`,
    tone: "#A5733F",
  },
  {
    id: "places-flower-van",
    label: "Flower Van",
    url: `${ASSET_ROOT}/dc39e8789_vincent-yap-JEn46oyrmN4-unsplash.jpg`,
    tone: "#6E7A55",
  },
  {
    id: "places-temple-mist",
    label: "Temple Mist",
    url: `${ASSET_ROOT}/31a2ef59a_wavie-hu-dIjCqVooMIg-unsplash.jpg`,
    tone: "#C9A46A",
  },
];

export const SEASON_IMAGES = [
  {
    id: "seasons-spring-blossom",
    label: "Spring Blossom",
    url: `${ASSET_ROOT}/3a4937d9a_agnese-rudzite-nim3L3siR7o-unsplash.jpg`,
    tone: "#D5DBE1",
  },
  {
    id: "seasons-summer-daisies",
    label: "Summer Daisies",
    url: `${ASSET_ROOT}/3760fa21d_aysegul-aytoren-5YL2eo4fNnM-unsplash.jpg`,
    tone: "#87B0E4",
  },
  {
    id: "seasons-misty-ridge",
    label: "Misty Ridge",
    url: `${ASSET_ROOT}/0e0e78104_laura-adai-IafQGHZfcBI-unsplash.jpg`,
    tone: "#C9C9C9",
  },
  {
    id: "seasons-glacier",
    label: "Glacier",
    url: `${ASSET_ROOT}/e05d553a5_mariano-baraldi-o7ZfuOskfO0-unsplash.jpg`,
    tone: "#B4C1CB",
  },
  {
    id: "seasons-frosted-bird",
    label: "Frosted Bird",
    url: `${ASSET_ROOT}/fd80ec123_wolfgang-hasselmann-ZqRY74ZiUKc-unsplash.jpg`,
    tone: "#E4E4E4",
  },
];

// One flat lookup, so a saved background id can always be resolved back to the
// photograph it points at without a database read.
export const GALLERY_IMAGES = [
  ...NATURE_IMAGES,
  ...PLACES_IMAGES,
  ...SEASON_IMAGES,
];

export function getGalleryImage(id) {
  if (typeof id !== "string") return null;
  return GALLERY_IMAGES.find((image) => image.id === id) || null;
}

export function isGalleryPhotoId(id) {
  return Boolean(getGalleryImage(id));
}

// Which collection a curated photograph belongs to, so the panel can reopen on
// the tab the user last chose from.
export function getGalleryCategory(id) {
  if (NATURE_IMAGES.some((image) => image.id === id)) return "nature";
  if (PLACES_IMAGES.some((image) => image.id === id)) return "places";
  if (SEASON_IMAGES.some((image) => image.id === id)) return "seasons";
  return null;
}

export const EMPTY_CATEGORY_COPY = {
  nature: "Nature photographs are on the way. Everything you can pick right now lives under Color and Your Photos.",
  places: "Places photography is on the way. Everything you can pick right now lives under Color and Your Photos.",
  seasons: "Seasonal photography is on the way. Everything you can pick right now lives under Color and Your Photos.",
};