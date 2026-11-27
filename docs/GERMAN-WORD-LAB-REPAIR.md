# German word-lab floor repair

Date: 2026-11-26. Separate user authorization after English A1 phase 3. Scope: the German word lab's curated-word floor failure only. No APK/release/commit/push.

Later authorized follow-up: [Russian/English word-lab repair](RUSSIAN-ENGLISH-WORD-LAB-REPAIR.md). Both remaining floors now pass, and the complete default verifier is green. The non-German failures recorded below describe the historical state at the end of the German-only repair.

## Diagnosis

The common verifier stopped at its first assertion: German had **138 curated cards against an unchanged floor of 154**. This did not establish that exactly 16 words had been deleted.

Inspection of the actual shipped Pre-A1/A1 sentences showed two distinct constraints:

1. Eight existing targets had usable beginner examples, but no standalone vocabulary gloss. Current annotations often teach a chunk instead (`der Zug`, `am Wochenende`, etc.). The core matcher requires a standalone gloss or its explicit German fallback. It therefore dropped otherwise recoverable cards.
2. Seventeen other old targets have no usable exact-token example in the current beginner course (or only a bare-word example, such as `Tür`). They remain unresolved rather than accepting prefix matches, advanced examples or invented sentences.

The curated target list also omitted useful basic vocabulary already taught by the shipped beginner course. The repair updates this list rather than pretending all old targets can be recovered unchanged.

## Narrow implementation

Only German-specific target/gloss data in `lib/languages/wordLabCore.ts` changed in the runtime for this repair. The earlier English active-inventory import in this shared file predates this repair and was retained.

- Recover eight existing targets by supplying their standalone Persian glosses: **bin, Kuchen, Telefon, Abend, Wochenende, nah, Platz, Zug**.
- Add eight foundational targets in their relevant teaching groups: **neun, elf** (complete the 1–12 number sequence); **Tochter, Bruder** (family); **links, rechts** (directions); **lernen** (learning); **heiß** (contrast with cold/warm). `Bruder` also needs an explicit standalone gloss because it is annotated inside chunks.
- Every added curated card takes its example text, Persian translation and pronunciation directly from an existing beginner lesson. No lesson, sentence, assessment, grammar matcher or level ceiling was edited. The established matcher permits meaningful short multiword utterances (e.g. `Um neun Uhr.` and `Elf Bücher.`), not only verb-containing sentences; this criterion was not relaxed.
- Exact-token matching is retained: no Küche/Kuchen or Tür/Türkei prefix substitution.

Result: **154 curated cards**, all with a usable spoken example under the existing rules; **803 total German word cards**. All **138 previous curated IDs** and all **795 previous learner-facing card IDs** remain present. Eight of the 16 added curated entries promote existing frequency-tail cards under the same learner IDs; the other eight add cards. Existing storage is not migrated, cleared or renamed. Examples/order may change through the existing selection algorithm; ID preservation is not a claim that every old example/order is frozen.

The 17 unresolved German targets are still reported explicitly: Kinder, Freundin, Tür, Handy, Woche, Straße, Toilette, Flughafen, Satz, teuer, bezahlen, krank, gelb, hell, Welcher, Krankenhaus, Apotheke. This repair passes the recorded floor; it does not claim that the German vocabulary syllabus is complete.

## Regression protection

`scripts/verify-german-word-lab-repair.cjs` and its compact pre-repair hash fixture check:

- unchanged floors: German 154, Russian 113, English 130;
- 154 German curated entries and the 16 specifically added targets;
- preservation of all previous curated and learner-facing IDs;
- exact existing beginner source text, translation and pronunciation for each added curated entry;
- identical German course inventory;
- byte-equivalent serialized Russian/English core cards, full word-card payloads and unresolved-target lists compared with the state before this repair.

`npm run validate:german-word-lab` runs the focused German content checks plus these repair boundaries.

The original common verifier defaults to **all three languages**, unchanged. A validated optional argument (`--language=de|ru|en`) allows explicit focused diagnostics. `npm run validate:word-lab` still invokes the common/default test; it was not silently narrowed to German.

## Validation results

Successful commands:

1. `npm run validate:german-word-lab` — includes all 12 original German word-lab checks.
2. `npm run typecheck`
3. `git diff --check`
4. `node scripts/verify-german-a1-integration.cjs`
5. `npm run validate:english-a1` — all five English A1 data/renderer/audit/phase checks.
6. `node scripts/verify-english-engine.cjs`
7. `node scripts/verify-lesson-assessment.cjs`
8. `node scripts/verify-progress-display.mjs`
9. `node scripts/verify-level-restart.cjs`

Additional diagnostic invocations **still fail**, now outside this authorized German repair:

- Default `node scripts/verify-word-lab-core.mjs`: German passes; then Russian fails at **105 < 113**.
- `node scripts/verify-word-lab-core.mjs --language=ru`: the same **105 < 113** floor failure.
- `node scripts/verify-word-lab-core.mjs --language=en`: English fails at **119 < 130**.

These are two pre-existing non-German floor deficits, not three distinct underlying issues. The default test previously stopped before reaching them. Their counts were measured before changing German, and the new snapshot guard proves their runtime payloads remained unchanged. The earlier report of a single failing command must not be interpreted as proof that German was the only issue behind that fail-fast command. No Russian/English floor or content was changed to conceal these findings.

Local full logs: `.cache/word-lab-fix/validation.json` and `.cache/word-lab-fix/validation/` (cache, not durable deliverables). This document records the reproducible results. Device audio and learner usability were not tested.
