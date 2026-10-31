// One shared expansion curve for all size-based breathing orbs.
// A future personalization control can replace DEFAULT_EXPANSION without
// changing the session clock or individual visual renderers.
export const DEFAULT_EXPANSION = 0.55;

export function breathScale(breath, expansion = DEFAULT_EXPANSION) {
  const value = Number.isFinite(breath) ? Math.min(1, Math.max(0, breath)) : 0;
  return 1 + expansion * value;
}
