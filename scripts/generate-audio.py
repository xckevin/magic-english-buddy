# /// script
# requires-python = ">=3.12,<3.14"
# dependencies = ["kokoro==0.9.4", "soundfile==0.13.1", "torch==2.11.0", "transformers==4.57.6"]
# ///
"""Pre-generate local course audio; no model or API key is shipped to children.

node scripts/export-audio-input.mjs 1
uv run scripts/generate-audio.py
Requires ffmpeg. The first run downloads Kokoro and its English phonemizer.
Existing clips with the same text/voice/model fingerprint are reused.
"""
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline, KModel

ROOT = Path(__file__).resolve().parent.parent
MODEL = "hexgrad/Kokoro-82M"
VOICE = "af_heart"
SPEED = 0.85
RATE = 24000
OUT = ROOT / "public/audio"
MANIFEST = ROOT / "src/data/audio/manifest.json"
OUT.mkdir(parents=True, exist_ok=True)
MANIFEST.parent.mkdir(parents=True, exist_ok=True)
stories = json.loads((ROOT / "test-results/audio-input.json").read_text())
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"clips": {}, "stories": {}}
manifest["generator"] = {"model": MODEL, "version": "1.0", "kokoro": "0.9.4", "voice": VOICE, "speed": SPEED}
checkpoint = ROOT / "test-results/kokoro-v1_0.pth"
if checkpoint.exists():
    digest = hashlib.sha256(checkpoint.read_bytes()).hexdigest()
    if digest != "496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4":
        raise ValueError("Local Kokoro v1.0 checkpoint checksum mismatch")
    model = KModel(repo_id=MODEL, model=str(checkpoint))
    pipeline = KPipeline(lang_code="a", repo_id=MODEL, model=model)
else:
    pipeline = KPipeline(lang_code="a", repo_id=MODEL)


def generate(text):
    fingerprint = hashlib.sha256(f"{MODEL}:1.0:0.9.4:{VOICE}:{SPEED}:{text}".encode()).hexdigest()[:20]
    filename = f"{fingerprint}.mp3"
    cached = manifest["clips"].get(text)
    if cached and cached["file"] == filename and (OUT / filename).exists():
        return
    results = list(pipeline(text, voice=VOICE, speed=SPEED))
    if not results or any(r.audio is None for r in results):
        raise RuntimeError(f"No audio: {text}")
    samples = np.concatenate([r.audio.numpy() for r in results])
    # Map the model's token durations to whitespace words used by the reader.
    # Do not reuse the hand-written, fictional timings in old Story data.
    spans = list(re.finditer(r"\S+", text))
    times = [[] for _ in spans]
    cursor = 0
    offset = 0.0
    for result in results:
        for token in result.tokens or []:
            start = text.find(token.text, cursor)
            if start < 0:
                raise ValueError(f"Cannot align {token.text!r} in {text!r}")
            cursor = start + len(token.text)
            if token.start_ts is None or token.end_ts is None:
                continue
            for i, span in enumerate(spans):
                if start < span.end() and cursor > span.start():
                    times[i].append((offset + token.start_ts, offset + token.end_ts))
        offset += len(result.audio) / RATE
    words = []
    for i, (span, stamps) in enumerate(zip(spans, times)):
        if not stamps:
            raise ValueError(f"No measured timing for {span.group()!r} in {text!r}")
        words.append({"word": span.group(), "index": i, "start": round(min(t[0] for t in stamps), 3), "end": round(max(t[1] for t in stamps), 3)})
    with tempfile.TemporaryDirectory() as directory:
        wav = Path(directory) / "clip.wav"
        sf.write(wav, samples, RATE)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "48k", str(OUT / filename)], check=True)
    manifest["clips"][text] = {"file": filename, "duration": round(len(samples) / RATE, 3), "words": words}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Generated {filename}: {text}", flush=True)


for story in stories:
    for paragraph in story["paragraphs"]:
        if len(paragraph["text"].split()) != len(paragraph["words"]):
            raise ValueError(f"Reader word mismatch in {story['id']}: {paragraph['text']}")
        generate(paragraph["text"])
    for question in story["questions"]:
        generate(question)
    text = " ".join(p["text"] for p in story["paragraphs"])
    manifest["stories"][text] = [p["text"] for p in story["paragraphs"]]
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n")
# Word pronunciations are also available without an installed system voice.
words = sorted({re.sub(r"^[^\w]+|[^\w]+$", "", word).lower()
                for story in stories for paragraph in story["paragraphs"] for word in paragraph["words"]})
for word in words:
    if word:
        generate("I" if word == "i" else word)
print(f"Ready: {len(manifest['clips'])} clips, {len(manifest['stories'])} stories", flush=True)
