# Course dictionary sources

`src/data/dictionary/course-supplement.ts` contains the 356 entries needed to
cover every clickable word in the 90 bundled stories. Each entry has at least
one sentence from its actual course context.

## ECDICT seed

The common-word seed was extracted from
[skywind3000/ECDICT](https://github.com/skywind3000/ECDICT) at commit
[`bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b`](https://github.com/skywind3000/ECDICT/tree/bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b),
using its `ecdict.csv` word, phonetic, English definition, and Chinese
translation fields. The repository's `LICENSE` identifies this revision as
MIT-licensed, copyright © 2025 Linwei. The exact source notice is retained in
[ECDICT-LICENSE.txt](licenses/ECDICT-LICENSE.txt) and applies to the derived
seed data retained here.

The source CSV is not committed. To refresh the frozen supplement from that
exact revision, obtain the CSV separately and run:

```sh
node scripts/build-course-dictionary.mjs /path/to/ecdict.csv
```

## Course review

The build script preserves an actual course sentence as the example and
replaces seed data where it would give the wrong sense. It authors definitions
for story-specific people and places, spelling exercises, numerals, possessive
time expressions, and words whose course sense needs clarification. The
review helper can show the candidate source record beside the course context:

```sh
node scripts/review-course-dictionary.mjs /path/to/ecdict.csv
```

Run `pnpm audit:content` after a change. The intended result is 100% coverage
for both clickable course words and their distinct normalized forms.
