# Generated offline audio

This directory contains 1,721 deduplicated MP3 clips for all 90 bundled L1–L7 stories: reader paragraphs, 76 English `image_choice` listening prompts, every displayed course-word form, and all 1,100 dictionary records (1,074 unique playable forms). `manifest.json` records each clip's byte count and SHA-256, plus the eight downloadable packs. Shared clips are listed by more than one pack but stored once.

- Generator: [Kokoro](https://github.com/hexgrad/kokoro) 0.9.4
- Model: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), v1.0, Apache-2.0
- Voice: `af_heart`, speed `0.85`; mono, 24 kHz, MP3 at 48 kbit/s
- Model checkpoint SHA-256: `496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4`
- Reproduce: `node scripts/export-audio-input.mjs && uv run --python 3.13 scripts/generate-audio.py`
- Verify MP3 decoding, timing, hashes, pack references, and source coverage: `node scripts/verify-audio.mjs`

Model weights and the generation runtime are not shipped with the app. The model license does not replace this repository's [content license](../../LICENSE). These are synthetic recordings: automated checks do not replace a human English-listening review, especially for names, spelling, animal sounds, and unusual phrasing.
