# Lauren guided-audio release checklist

## Existing Pause flow
- User chooses need (Calm, Focus, Wind Down, Reset).
- User chooses Guided or Not Guided.
- Existing need/category filters choose a technique. Audio never chooses the technique.
- The selected technique opens on the existing breathing screen.

## Audio assets required
Extract the supplied `AlwaysPause_Lauren_GitHub_Assets.zip` into the repository root **on this branch**. The archive contains:
- `public/audio/lauren/manifest.json`
- `public/audio/lauren/durations.json`
- `public/audio/lauren/clip_001.mp3` through `clip_064.mp3`

**Do not merge before these assets are committed.** The draft PR has code but not the 66 binary/data assets.

## Expected behavior
- Not Guided: breathing clock waits 2 seconds; orb stays resting.
- Guided with matching introduction: play introduction, wait for actual playback completion, wait 1 second, then start clock.
- Guided with no matching intro, video-first, or failed library: settle 2 seconds, then begin without Lauren.
- Phase MP3s only play when a matching technique and phase are found and recorded duration plus 350ms fits the phase. Audio never adjusts the orb's duration.
- A closing MP3, when present, plays after completed cycles.
- Exiting cancels active audio.

## Before shipping
1. Run `npm ci && npm run build && npm run lint`.
2. Test in Safari on iPhone and the actual Capacitor app. **Important:** iOS may block `new Audio().play()` when started asynchronously after fetch; verify the first introduction actually speaks after tapping Begin. If blocked, use a user-gesture-unlocked audio engine or pre-unlocked Web Audio.
3. Test each of 42 audio-mapped techniques against the live Base44 phase labels and durations; Base44 data isn't bundled in GitHub.
4. Confirm no clip crosses a phase boundary, particularly 1–2-second holds.
5. Test pause/exiting, background/foreground, Bluetooth/headphones, silent mode, offline/cached assets, and end-of-session close.
6. Ensure guided voice isn't presented as working if files are absent. Validate all 66 assets are served correctly.
7. Merge only after successful device testing.

**Status:** integration draft; not yet release-certified.
