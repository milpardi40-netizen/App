# English A1 — audit remediation, phase 1

Follow-up implementation: [phase 2 — staged teaching and functional transfer](ENGLISH-A1-AUDIT-PHASE2.md). The remaining-work list below records the situation at the end of phase 1.

Date: 2026-11-26. Baseline: `21abe03ae4d2beb46fb45a9ac45f17ea6b597e45`.
Scope: **English A1 only**. This is the first, correctness/availability phase of the Persian pedagogical audit in `reports/english-a1-audit-fa.md`, not a claim that the entire course now proves A1 mastery.

## Implemented

### Quarantine, not deletion

- The exact eight `lab-en-a1-01` through `lab-en-a1-08` lessons remain in the historical `SENTENCE_LESSONS` inventory. Their payloads, IDs, numbering and stored history remain valid for backup/import/sync.
- `ENGLISH_LEARNER_LESSONS` excludes those eight only. Library/home, metrics, resume snapshots, review, dialogue-room selection, level studio, word lab, podcast, shared-level practice and English suggestions use this learner projection. Podcast numbering outside A1 is preserved.
- Old `/course/lesson?id=lab-en-a1-*` links show a clear notice and an A1-library action **before** mounting the lesson or its speech/session effects. Normal lookup cannot open the quarantined lessons.
- Due reviews and new progression do not select them. Restarting active A1 does not reset their archived sessions/chunks. Backup validation deliberately still recognizes them.
- Learner A1: **29 lessons**. Historical A1 inventory: **37 records**. No other level or language was renumbered.

### Correctness of current core material

- Corrected the seven glossary strings responsible for 27 placeholder occurrences; no generated core glossary entry now has the meaning `واژهٔ پرتکرار`. The offline compiler rejects any recurrence in its selected glossary output.
- Corrected `See you`, temporal `work on Monday` segmentation, departure `leave`, nominal `drink`, imperative `close`, existential `there is/are` and questions, and the negative `there is no` pattern. Corrected the travel `going to + verb` pattern and the Persian approximation of `does`.
- Removed the full-name answer cue from the spelling listening task: `T. I. M.`.
- Added an explicit `not sunny` cue to the weather listening task. The weather reading question now asks which season Anna likes rather than inferring her favorite.
- Repaired the ownership continuity in the final exchange of the objects/places dialogue.
- **All 1450 core sentence IDs and English/Persian sentence texts are unchanged**, as are the 29 lesson IDs/count/order. This phase changes glosses, a pronunciation token, two pattern labels, comprehension tasks and one scene ending—not the whole sentence curriculum.

### Supplement and assessment honesty

- Corrected forecast/current-weather mismatch, ambiguous two-train question, proposal-versus-agreement question and the café meeting after closing time.
- These four supplemental questions get explicitly authored `:audit-v2` IDs. The 20 unit IDs and original ten units' question IDs remain stable. Old answer records remain stored but cannot silently pass a materially corrected question.
- Fixed the final listening question's sister/friend mismatch and its unrelated Saturday explanation wording.
- Reclassified 28 supplemental A1 multiple-choice cloze activities and all 8 final A1 multiple-choice “writing” activities as grammar/vocabulary, without changing their existing IDs solely for a label correction.
- Current final A1 assessment composition: **16 grammar/vocabulary + 8 reading + 8 listening + 0 independent writing/speaking**. The screen explicitly states this limitation, the internal 80% criterion and the absence of CEFR certification. A zero-size writing category is displayed as not assessed, not as a 0% proficiency score.
- Supplemental skill reports classify old evidence by the current activity definition, not obsolete stored `writing` labels. Retired question evidence remains in history but does not inflate current totals.
- Core evidence and the final-stage notice distinguish route completion from passing checks and independent mastery. No new completion gate or forced reset of completed lessons was added.

## Compatibility

- Core assessment revision and task namespace: v2. Previous question evidence remains stored; current checks do not inherit v1 correctness. Stage, sentence position and completed lesson history are retained.
- Dialogue-room revision: v2. Previous room history is retained in the previous revision namespace.
- Core sentence/content revision is deliberately unchanged: sentence meanings have not changed, so drafts, chunks and sentence review schedules do not require a new content generation.
- Supplemental final question IDs/answers remain compatible, so historical final attempts and scores remain intact. Taxonomy is corrected on display; no historical attempt is promoted to an independent proficiency certificate.
- Foundation supplemental units/final, all Pre-A1 evidence, non-A1 English lesson payloads, archived lab payloads and all six other language curricula are protected by runtime hashes/assertions.

## Validation

`npm run validate:english-a1` now also runs `verify-english-a1-audit-fixes.cjs`.

Successful checks include:

- TypeScript `tsc --noEmit`, `git diff --check`, deterministic offline regeneration.
- English A1 data/progress, 58 rendered room runs, production/skill integration and new audit-specific regressions.
- Web and native-storage simulation for legacy lab backups, due reviews, snapshots/resume, unchanged drafts/history, supplemental question versions, corrected skill totals and core v1→v2 assessment migration.
- Sixteen rendered route-guard cases: all eight retired IDs, each as a string and array parameter; no lazy lesson mounted.
- English engine/four-skills/lesson flow/supplement/backup, shared assessment, progress display, level resume/restart, dialogue room, operator speech, stage controls, speaking skip, seven-language UI, Pre-A1 boundaries and narration contracts.

There were **26 distinct successful check commands** in the final validation run (one audit command was additionally repeated), plus one existing failure: `verify-word-lab-core.mjs` stops at the German curated-word floor, **138 < 154**. Running that same verifier against the untouched committed baseline in an isolated scratch tree reproduced the identical failure. No German content or floor was changed to conceal it. Full logs are local audit artifacts under `.cache/english-a1-fixes/`.

No real-device listening/usability trial or APK build was performed in this phase.

## Still to do in the next pedagogical phase

- Explicit within-lesson scaffolding and retrieval substeps for dense lessons 9 and 21.
- Replace selected mechanical substitutions with meaningful choices, information gaps and transfer to new data.
- Integrate or explicitly label prerequisite/review/extension roles for separate supplemental units.
- Add genuinely independent writing/interaction tasks and task-specific rubrics, then evaluate with actual post-Pre-A1 learners.

The current fixes resolve immediate known correctness and presentation defects; they do **not** turn the existing assessment into a comprehensive four-skills A1 proficiency test.
