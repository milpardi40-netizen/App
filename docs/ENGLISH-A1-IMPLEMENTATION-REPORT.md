# English A1 — implementation and technical validation

Date: 2026-11-26. Scope: the approved 29 core English A1 lessons, implemented together on the current working branch. This report does not authorize an APK release.

## Implemented

- Approved prerequisite-connected order, from introductions/spelling/help through everyday language to services and health. The existing Pre-A1 band remains before A1.
- 29 lessons × 50 rows = 1,450 stable lesson/sentence slots. Exactly 1,445 slots change English and/or Persian wording; the five unchanged slots do not have their review schedules reset.
- 174 scene turns, 232 versioned assessment tasks (eight per lesson), 29 writing prompts and 58 optional listening/reading practices.
- Room feed includes the scene and all 50 taught rows for either starter. Existing ten-stage flow remains; no new course schema version or UI redesign.
- Eight separate vocabulary labs, all other English bands/supplement and every other language's assembled inventory are protected by baseline hashes. Independently completed Russian A1 changes remain intact.
- Offline reproducible authoring sources, fixed pronunciation/vocabulary data and license attribution under `docs/english-a1-design/runtime/`. `python docs/english-a1-design/runtime/generate.py` reproduces both generated modules and the migration manifest byte-for-byte.

## Existing learner data

- Lesson/sentence IDs, completion records and saved A1 lesson ID are retained. Historical study time/evidence remains stored. Changed assessment IDs cannot reuse obsolete answers as current mastery.
- Old chunk keys remain in storage. Current lesson resume/tallies project only the new revision's chunk keys.
- Changed review meanings restart scheduling once, archiving the old schedule/rating history in `previousContent`. Current and historical performed reviews both contribute to profile totals; old mastery does not count as new mastery.
- Cloud card merges and backup restores merge old-content ratings separately from current-content ratings, even when a stale device has a later review timestamp. Tests cover both merge directions, repeated merges, JSON round trips, current scheduling and historical totals.
- Old production drafts and room histories are retained under their old keys. A changed writing task starts blank under its revision-specific key; old draft text is not displayed as a current answer.

## Verified results

- `npm run typecheck` and `git diff --check`: pass.
- `npm run validate:english-a1`: pass. Data/protection checks cover all 29 lessons, all stable slots and 58 web/iOS-storage-stub migration cases. Revision-aware cloud/backup conflict cases are included in each case.
- Real mounted React components: 58 complete Room runs, covering all 1,450 educational learner targets for EACH starter (2,900 targets total); 29 ProductionTask mounts; 58 optional comprehension mounts. Listening text stays hidden before successful completion; reading text remains visible.
- `npm run validate:russian-a1`: pass, including 58 mounted rooms / 928 learner targets and 29 writing tasks.
- English engine: 4,235 checks pass; four-area logic: 1,349 checks pass; lesson flow: 43 checks pass; backup: 49 checks pass; reset/history: 28 checks pass; personal sync: 34 checks pass.
- Additional passing scripts: Russian course, Russian masculine Pre-A1, Russian practical/dedup, Russian sentence checker, Russian speech flow, lesson gender, lesson assessment, level resume, app resume, six-language practical Pre-A1, Pre-A1 balance, dialogue room, English supplement and progress display.
- Obsolete English A1 row/order/task-count fixtures were replaced with approved-design checks and the full scoped content/protection validator. Non-target expectations remain protected.

## Limits and release gate

These are automated data, React-renderer and storage-stub tests, not physical-device or audible microphone tests. Browser end-to-end scripts were not run in this implementation pass; their old A1 fixtures still need refresh before using them as a release gate. A complete independent bilingual/pedagogical review and native pronunciation/audio review are not claimed. Persian-script pronunciation is an approximate learning aid, not precise phonetic transcription.

**APK generation remains ON HOLD**, as requested, until the damaging release-179 defects are supplied and addressed. No APK, release, commit, push or pull request was created by this English implementation pass.
