# Generated course audio

These 295 MP3 clips were generated locally on 2026-09-15 from the bundled L1 course text: 20 stories, English quiz prompts, and 190 individual word pronunciations. Total encoded size: 3,643,700 bytes.

- Generator: [Kokoro](https://github.com/hexgrad/kokoro) 0.9.4
- Model: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), v1.0, Apache-2.0
- Voice: `af_heart`, speed `0.85`; mono, 24 kHz, MP3 at 48 kbit/s
- Model checkpoint SHA-256: `496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4`
- Source text and predicted word timings: `src/data/audio/manifest.json`
- Reproduction: `scripts/export-audio-input.mjs`, `scripts/generate-audio.py`
- Validation: `node scripts/verify-audio.mjs` (requires ffmpeg and ffprobe)

Model weights and the generation runtime are not distributed with the app. The model license does not replace this repository's [content license](../../LICENSE). These are synthetic recordings; technical validation does not replace English-language listening review, particularly for spelling exercises, names, and animal sounds.
