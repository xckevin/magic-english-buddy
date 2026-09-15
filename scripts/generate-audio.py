# /// script
# requires-python = ">=3.12,<3.14"
# dependencies = ["kokoro==0.9.4", "soundfile==0.13.1", "torch==2.11.0", "transformers==4.57.6"]
# ///
"""Generate resumable, deduplicated offline audio packs.

node scripts/export-audio-input.mjs [level]
uv run --python 3.13 scripts/generate-audio.py

Each completed clip is atomically recorded. Packs are only published once all
their files, byte counts, and SHA-256 hashes are present.
"""
import hashlib
import json
import os
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline, KModel

ROOT = Path(__file__).resolve().parent.parent
MODEL, VOICE, SPEED, RATE = "hexgrad/Kokoro-82M", "af_heart", 0.85, 24000
OUT, MANIFEST, INPUT = ROOT / "public/audio", ROOT / "src/data/audio/manifest.json", ROOT / "test-results/audio-input.json"
OUT.mkdir(parents=True, exist_ok=True)
MANIFEST.parent.mkdir(parents=True, exist_ok=True)
input_data = json.loads(INPUT.read_text())
levels, stories, dictionary_words = input_data["levels"], input_data["stories"], input_data["dictionaryWords"]
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"clips": {}, "stories": {}}
manifest.setdefault("clips", {})
manifest.setdefault("stories", {})
if levels == [1, 2, 3, 4, 5, 6, 7]:
    # A full run rebuilds each package from verified, on-disk clip metadata.
    manifest.pop("packs", None)
manifest["generator"] = {"model": MODEL, "version": "1.0", "kokoro": "0.9.4", "voice": VOICE, "speed": SPEED}


def write_manifest():
    encoded = (json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    temporary = MANIFEST.with_suffix(".json.tmp")
    temporary.write_bytes(encoded)
    os.replace(temporary, MANIFEST)


def fingerprint(text):
    return hashlib.sha256(f"{MODEL}:1.0:0.9.4:{VOICE}:{SPEED}:{text}".encode()).hexdigest()[:20]


def metadata(file):
    return {"bytes": file.stat().st_size, "sha256": hashlib.sha256(file.read_bytes()).hexdigest()}


checkpoint = ROOT / "test-results/kokoro-v1_0.pth"
if checkpoint.exists():
    if hashlib.sha256(checkpoint.read_bytes()).hexdigest() != "496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4":
        raise ValueError("Local Kokoro v1.0 checkpoint checksum mismatch")
    pipeline = KPipeline(lang_code="a", repo_id=MODEL, model=KModel(repo_id=MODEL, model=str(checkpoint)))
else:
    pipeline = KPipeline(lang_code="a", repo_id=MODEL)


def generate(text):
    filename, file = f"{fingerprint(text)}.mp3", OUT / f"{fingerprint(text)}.mp3"
    cached = manifest["clips"].get(text)
    if cached and cached.get("file") == filename and file.exists():
        cached.update(metadata(file))
        write_manifest()
        return
    results = list(pipeline(text, voice=VOICE, speed=SPEED))
    if not results or any(result.audio is None for result in results):
        raise RuntimeError(f"No audio: {text}")
    samples = np.concatenate([result.audio.numpy() for result in results])
    spans, timings, cursor, offset = list(re.finditer(r"\S+", text)), None, 0, 0.0
    timings = [[] for _ in spans]
    for result in results:
        for token in result.tokens or []:
            start = text.find(token.text, cursor)
            if start < 0:
                raise ValueError(f"Cannot align {token.text!r} in {text!r}")
            cursor = start + len(token.text)
            if token.start_ts is not None and token.end_ts is not None:
                for index, span in enumerate(spans):
                    if start < span.end() and cursor > span.start():
                        timings[index].append((offset + token.start_ts, offset + token.end_ts))
        offset += len(result.audio) / RATE
    words = []
    for index, (span, stamps) in enumerate(zip(spans, timings)):
        if not stamps:
            raise ValueError(f"No measured timing for {span.group()!r} in {text!r}")
        words.append({"word": span.group(), "index": index, "start": round(min(stamp[0] for stamp in stamps), 3), "end": round(max(stamp[1] for stamp in stamps), 3)})
    with tempfile.TemporaryDirectory() as directory:
        wav, temporary_mp3 = Path(directory) / "clip.wav", Path(directory) / filename
        sf.write(wav, samples, RATE)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "48k", str(temporary_mp3)], check=True)
        os.replace(temporary_mp3, file)
    manifest["clips"][text] = {"file": filename, "duration": round(len(samples) / RATE, 3), "words": words, **metadata(file)}
    write_manifest()
    print(f"Generated {filename}: {text}", flush=True)


def lesson_word(word):
    value = re.sub(r"^[^\w'’-]+|[^\w'’-]+$", "", unicodedata.normalize("NFKC", word), flags=re.UNICODE).lower()
    return "I" if value == "i" else value


def required_story_text(story):
    return " ".join(paragraph["text"] for paragraph in story["paragraphs"])


# Course data comes first so a stopped run remains useful to each lesson.
for story in stories:
    for paragraph in story["paragraphs"]:
        if [lesson_word(word) for word in paragraph["text"].split()] != [lesson_word(word) for word in paragraph["words"]]:
            raise ValueError(f"Reader word mismatch in {story['id']}: {paragraph['text']}")
        generate(paragraph["text"])
    for question in story["listeningQuestions"]:
        generate(question)
    for word in sorted({lesson_word(word) for paragraph in story["paragraphs"] for word in paragraph["words"] if lesson_word(word)}):
        generate(word)
    manifest["stories"][required_story_text(story)] = [paragraph["text"] for paragraph in story["paragraphs"]]
    write_manifest()
for word in dictionary_words:
    generate(word)


def files_for(texts):
    files = []
    seen = set()
    for text in texts:
        clip = manifest["clips"].get(text)
        if not clip:
            raise ValueError(f"Missing required clip: {text}")
        if clip["file"] not in seen:
            seen.add(clip["file"])
            files.append(clip["file"])
    return sorted(files)


if levels != [1, 2, 3, 4, 5, 6, 7]:
    print(json.dumps({"clips": len(manifest["clips"]), "stories": len(manifest["stories"]), "packs": "unchanged (selected-level run)"}), flush=True)
    raise SystemExit(0)

packs = []
for level in range(1, 8):
    level_stories = [story for story in stories if story["level"] == level]
    texts = [text for story in level_stories for text in (
        [paragraph["text"] for paragraph in story["paragraphs"]]
        + story["listeningQuestions"]
        + [lesson_word(word) for paragraph in story["paragraphs"] for word in paragraph["words"] if lesson_word(word)]
    )]
    files = files_for(texts)
    packs.append({"id": f"l{level}", "title": f"L{level} 离线音频包", "level": level, "storyCount": len(level_stories), "files": files, "bytes": sum((OUT / file).stat().st_size for file in files)})
dictionary_files = files_for(dictionary_words)
packs.append({"id": "dictionary", "title": "内置词典发音包", "storyCount": 0, "files": dictionary_files, "bytes": sum((OUT / file).stat().st_size for file in dictionary_files)})
# The previous L1 bundle also contained English prompts for non-listening quiz
# types. Keep only those prompts discoverable in L1. An unknown orphan is a
# generation/data error; never silently attribute a future L7 file to L1.
covered = {file for pack in packs for file in pack["files"]}
legacy_l1_prompts = {
    question for story in stories if story["level"] == 1
    for question in story.get("allEnglishQuizQuestions", [])
}
legacy_files = sorted({manifest["clips"][text]["file"] for text in legacy_l1_prompts if text in manifest["clips"]} - covered)
unknown_files = {clip["file"] for clip in manifest["clips"].values()} - covered - set(legacy_files)
if unknown_files:
    raise ValueError(f"Unpackaged audio files: {sorted(unknown_files)}")
if legacy_files:
    l1_pack = next(pack for pack in packs if pack["id"] == "l1")
    l1_pack["files"] = sorted(set(l1_pack["files"]) | set(legacy_files))
    l1_pack["bytes"] = sum((OUT / file).stat().st_size for file in l1_pack["files"])
manifest["packs"] = packs
write_manifest()
print(json.dumps({"clips": len(manifest["clips"]), "stories": len(manifest["stories"]), "packs": [{"id": p["id"], "files": len(p["files"]), "bytes": p["bytes"]} for p in packs]}), flush=True)
