"""Offline Kokoro narration production for Always Pause.

Run in Google Colab (Python 3.12):
    %pip install kokoro==0.9.4 soundfile
    !apt-get -qq install -y espeak-ng
    %run scripts/generate_kokoro_narration.py

Generates voice-specific, phase-aligned clips for all 50 technique drafts.
The orb remains the authoritative clock; recordings never change phase timing.
Only publish clips after listening and checking duration_report.json.
"""
import json
import pathlib
import re
import urllib.request
import zipfile

import numpy as np
import soundfile as sf
from kokoro import KPipeline

SOURCE = "https://raw.githubusercontent.com/mcdeverin/pause/main/public/narration/always_pause_50_narration_scripts.json"
OUTPUT = pathlib.Path("always_pause_audio_review")
SAMPLE_RATE = 24000
BUFFER_MS = 250
# Change this list to ["af_nicole"] for a quick first pass.
# These are Kokoro voices, not the previously selected ElevenLabs voice IDs.
VOICES = {
    "af_nicole": "a",
    "am_michael": "a",
    "bf_emma": "b",
    "bm_george": "b",
}
SPEED = 0.90
OUTPUT.mkdir(exist_ok=True)
with urllib.request.urlopen(SOURCE) as response:
    techniques = json.load(response)["techniques"]
assert len(techniques) == 50, f"Expected 50 techniques; got {len(techniques)}"

def slug(value):
    return re.sub(r"[^a-z0-9_-]+", "_", str(value).lower()).strip("_")

def render(pipeline, text, voice):
    chunks = [np.asarray(audio, dtype=np.float32) for _, _, audio
              in pipeline(text, voice=voice, speed=SPEED)]
    if not chunks:
        raise RuntimeError(f"Empty synthesis for {voice}: {text}")
    return np.concatenate(chunks)

report = []
for voice, lang in VOICES.items():
    pipeline = KPipeline(lang_code=lang)
    for number, technique in enumerate(techniques, 1):
        technique_id = str(technique["technique_id"])
        directory = OUTPUT / voice / technique_id
        directory.mkdir(parents=True, exist_ok=True)
        items = [
            ("intro", technique.get("intro_text"), None),
            *[(f"phase_{p['phase_index']}", p["spoken_text"], p)
              for p in technique["phase_cues"]],
            ("closing", technique.get("closing_text"), None),
        ]
        for key, text, phase in items:
            if not text:
                continue
            audio = render(pipeline, text, voice)
            duration_ms = round(len(audio) * 1000 / SAMPLE_RATE)
            limit_ms = int(phase["max_audio_ms"]) if phase else None
            fits = (duration_ms + BUFFER_MS <= limit_ms) if limit_ms else None
            file = directory / f"{key}.wav"
            sf.write(file, audio, SAMPLE_RATE)
            report.append({
                "voice": voice,
                "technique_id": technique_id,
                "technique_name": technique["technique_name"],
                "cue": key,
                "phase_index": phase["phase_index"] if phase else None,
                "phase_duration_ms": phase["duration_ms"] if phase else None,
                "audio_duration_ms": duration_ms,
                "max_audio_ms": limit_ms,
                "fits_with_buffer": fits,
                "file": file.as_posix(),
                "spoken_text": text,
            })
        print(f"{voice}: {number}/{len(techniques)} — {technique['technique_name']}")
(OUTPUT / "duration_report.json").write_text(json.dumps(report, indent=2))
failed = [r for r in report if r["fits_with_buffer"] is False]
print(f"Generated {len(report)} recordings across {len(VOICES)} voices and {len(techniques)} techniques.")
print(f"Needs timing review: {len(failed)} phase recordings.")
for row in failed[:40]:
    print(f"REVIEW {row['voice']} / {row['technique_name']} / {row['cue']}: "
          f"{row['audio_duration_ms']}ms (limit {row['max_audio_ms']}ms, "
          f"plus {BUFFER_MS}ms buffer)")
archive = pathlib.Path("always_pause_audio_review.zip")
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
    for f in OUTPUT.rglob("*"):
        if f.is_file():
            z.write(f, f.relative_to(OUTPUT.parent))
print(f"Download review archive: {archive}")
