// Curated background photography. Only real, licensed photographs belong in these
// lists — nothing is generated or substituted. Until a collection is populated it
// renders a clean empty state instead of placeholder imagery.
//
// Each image: { id, label, url, tone } where `tone` is an optional css background
// used behind the photo while it loads.

export const BACKGROUND_CATEGORIES = [
  { id: "nature", label: "Nature" },
  { id: "places", label: "Places" },
  { id: "seasons", label: "Seasons" },
  { id: "color", label: "Color" },
  { id: "photos", label: "Your Photos" },
];

export const SEASONS = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];

export const NATURE_IMAGES = [];
export const PLACES_IMAGES = [];

export const SEASON_IMAGES = {
  spring: [],
  summer: [],
  autumn: [],
  winter: [],
};

export const EMPTY_CATEGORY_COPY = {
  nature: "Nature photographs are on the way. Everything you can pick right now lives under Color and Your Photos.",
  places: "Places photography is on the way. Everything you can pick right now lives under Color and Your Photos.",
  seasons: "Seasonal photography is on the way. Everything you can pick right now lives under Color and Your Photos.",
};