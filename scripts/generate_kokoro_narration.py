"""Run in Google Colab after: %pip install kokoro==0.9.4 soundfile
and: !apt-get -qq install -y espeak-ng
Creates WAV files for the 50 existing technique scripts and reports phase fit.
Audio files are NOT published automatically: review timing and quality first.
"""
import io
import json
import pathlib
import urllib.request
import zipfile
import numpy as np
import soundfile as sf
from kokoro import KPipeline

MANIFEST_URL = "https://raw.githubusercontent.com/mcdeverin/pause/main/public/narration/always_pause_50_narration_scripts.json"
VOICE = "af_nicole"
SPEED = 0.82
RATE = 24000
OUTPUT = pathlib.Path("always_pause_nicole")
OUTPUT.mkdir(exist_ok=True)
with urllib.request.urlopen(MANIFEST_URL) as response:
    techniques = json.load(response)["techniques"]
pipeline = KPipeline(lang_code="a")

def synthesize(text):
    parts = [np.asarray(audio, dtype=np.float32) for _, _, audio in pipeline(text, voice=VOICE, speed=SPEED)]
    return np.concatenate(parts) if parts else np.array([], dtype=np.float32)

report = []
for number, technique in enumerate(techniques, 1):
    key = technique["technique_id"]
    folder = OUTPUT / key
    folder.mkdir(exist_ok=True)
    for phase in technique["phase_cues"]:
        index = phase["phase_index"]
        spoken = phase["spoken_text"]
        audio = synthesize(spoken)
        seconds = len(audio) / RATE
        allowed = phase["max_audio_ms"] / 1000
        path = folder / f"phase_{index}.wav"
        sf.write(path, audio, RATE)
        report.append({
            "technique_id": key, "technique_name": technique["technique_name"],
            "phase_index": index, "text": spoken, "file": str(path),
            "duration_seconds": round(seconds, 3),
            "max_seconds": allowed, "fits": seconds <= allowed
        })
    print(f"{number}/{len(techniques)}: {technique['technique_name']}")
(OUTPUT / "duration_report.json").write_text(json.dumps(report, indent=2))
failed = [row for row in report if not row["fits"]]
print(f"Generated {len(report)} phase clips for {len(techniques)} techniques.")
print(f"Phase clips exceeding timing limits: {len(failed)}")
for row in failed[:30]:
    print(f"REVIEW: {row['technique_name']} phase {row['phase_index']} {row['duration_seconds']}s > {row['max_seconds']}s")
zip_path = pathlib.Path("always_pause_nicole_review.zip")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
    for file in OUTPUT.rglob("*"):
        if file.is_file():
            archive.write(file, file.relative_to(OUTPUT.parent))
print("Review archive:", zip_path)
