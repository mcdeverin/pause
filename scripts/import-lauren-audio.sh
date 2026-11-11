#!/usr/bin/env bash
set -euo pipefail

# Install the previously generated Lauren recordings into the Git-tracked app.
# Run from any directory after switching to feature/lauren-audio.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" != "feature/lauren-audio" ]]; then
  echo "Switch to feature/lauren-audio first (currently: $BRANCH)." >&2
  exit 1
fi

ARCHIVE="${1:-$HOME/Downloads/AlwaysPause_Lauren_Integration.zip}"
if [[ ! -f "$ARCHIVE" ]]; then
  echo "Cannot find ZIP: $ARCHIVE" >&2
  echo "Provide the path as the first argument." >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT
unzip -q "$ARCHIVE" -d "$TEMP_DIR"

AUDIO_SOURCE="$TEMP_DIR/public/audio/lauren"
if [[ ! -d "$AUDIO_SOURCE" ]]; then
  echo "ZIP does not contain public/audio/lauren." >&2
  exit 1
fi

COUNT="$(find "$AUDIO_SOURCE" -maxdepth 1 -type f -name 'clip_*.mp3' | wc -l | tr -d ' ')"
if [[ "$COUNT" != "64" ]]; then
  echo "Expected 64 Lauren recordings, found $COUNT." >&2
  exit 1
fi

mkdir -p public/audio/lauren
cp "$AUDIO_SOURCE"/clip_*.mp3 public/audio/lauren/
node scripts/validate-lauren-audio.mjs

git add public/audio/lauren
if git diff --cached --quiet; then
  echo "Lauren audio files already match the branch. Nothing new to commit."
else
  git commit -m "Add Lauren's 64 recorded narration clips"
fi
git push -u origin feature/lauren-audio

echo "Done: 64 recorded clips are tracked in feature/lauren-audio."
