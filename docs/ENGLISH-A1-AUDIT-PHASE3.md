# English A1 audit — phase 3: route bridges, fresh listening and supported interaction

Date: 2026-11-26. Continues `ENGLISH-A1-AUDIT-PHASE2.md`. Scope: **only current English A1**. No APK, release, commit or push was made for this phase.

Subsequent, separately authorized follow-ups: [German word-lab repair](GERMAN-WORD-LAB-REPAIR.md), then [Russian/English word-lab repair](RUSSIAN-ENGLISH-WORD-LAB-REPAIR.md). All three recorded word-lab floors and the complete default verifier now pass. The phase-3 results below describe the historical state before those separate repairs.

## 1. Relating the two learning routes

`lib/englishA1SupplementMap.ts` explicitly maps all **20 A1 supplement units** to the approved 29-lesson core route. Each entry identifies related core lessons, one suggested point in the sequence, a role (suggested preparation / related review / optional extension), and a Persian explanation. The `foundation-5` through `foundation-10` IDs belong to the A1 supplement track despite their names; the four actual Foundation units are not reclassified.

The introduction stage of all 29 core lessons now shows the relevant links, with timing visible before opening a unit. Whole-unit timing is intentional: for example, the weather-and-plans supplement is suggested after core lesson 21, not treated as a prerequisite for the earlier weather lesson. The profile/form and longer-message bundles are similarly placed after their relevant structures, rather than implying that every bundled topic must be mastered before lesson 1.

`app/lang/a1-support.tsx` and `components/EnglishA1Support.tsx` provide a **read-only teaching preview** with example playback and links back to the suggested core lesson or to the existing supplement route. Previewing teaching is available independently of the supplement exercise locks. It neither opens a locked exercise nor writes evidence, drafts, completion or assessment results. The existing supplement screen also shows mapping/timing, and its selected-unit view links to the same bridge.

Existing `canOpenUnit`, Foundation assessment gates and supplement exercise/assessment behavior remain in place. Completing these 20 units is **not** a new requirement to finish any core lesson. The mapping is pedagogical guidance, not a new dependency engine.

## 2. Twenty-nine fresh listening-transfer tasks

`docs/english-a1-design/runtime/listeningApplications.json` is a durable authored source consumed by the deterministic generator. It replaces the 29 optional listening tasks that previously duplicated saved lesson evidence. Reading-transfer tasks from phase 2 are unchanged. There are still **58 optional comprehension tasks: 29 listening + 29 reading**.

The new listening data distinguish facts needed for action, including:

- country versus city; spelling from individual letters rather than a name stated beforehand;
- a contact code versus an age; object versus owner and location;
- bus number versus departure time; old versus newly confirmed appointment;
- an incorrect drink repeat-back versus the actual order;
- an accepted invitation versus a proposed alternative;
- rent period, return-travel day, hotel room number, and after/before in a phone message.

Each task includes its own data, three choices and explanatory feedback. These are authored transfer-practice items, **not independently validated proficiency test items**. Lesson 12 listening stays focused on today's weather; it does not introduce future grammar before the staged lesson 21 teaching.

The actual core stage-2 screen uses `EnglishA1ListeningTransfer`, wrapping the existing `EnglishSupplementTask` playback-completion logic. Normal and slow playback are available. Merely pressing Play or selecting an option does not count as completed listening: the callback must finish successfully before checking. Failed audio can be retried; the learner may still continue the main lesson. The transcript appears only after a correct answer following completed playback. Closing/reopening the optional activity resets its local state.

An explicit local `onSave` callback **does not persist anything**; it only controls transcript visibility. No optional result is written to supplement evidence or the core assessment. The two new optional audio-rate props on the shared task renderer retain its previous defaults (0.78 and no separate slow button) for all existing callers. The new wrapper alone requests 1× and 0.5×.

## 3. Supported response-and-clarification rehearsal

`lib/englishA1Interactions.ts` adds **12 selected two-turn rehearsals, each with two learner-selected follow-up branches** (24 branch paths): language help, object location, routines, café, directions, public transport, appointments, invitations, yesterday/tomorrow, renting, hotel and phone messages.

The stage-9 component shows a fictional context and the partner's first line, asks the learner to speak before revealing one possible response, and then offers two explicitly scripted follow-ups. Follow-ups require clarification, correcting a misheard fact, confirming new information or asking for missing information. Examples include correcting room twenty to twelve, before six to after six, distinguishing a new appointment from an old one, and not claiming agreement when a second invitation has been refused.

The learner can hear each partner turn normally or slowly, see a sample only on request, self-check three criteria, and restart with another branch. The UI explicitly says:

- the program does not hear or analyze the learner's response;
- the branch is chosen by the learner, not inferred from speech;
- the examples are possible answers, not the only correct answers;
- checkboxes and responses are unsaved and do not affect lesson completion or scores.

This is **supported scripted rehearsal**, not free conversation, automatic pronunciation assessment, adaptive dialogue or a comprehensive A1 interaction assessment. It covers 12 selected situations, not all 29 lessons. The existing dialogue room remains underneath with its previous scripts, echo-review section and history. Echo review has not been renamed as interaction.

## Preservation boundaries

- **29 core lessons / 1450 sentence slots / 10 top-level stages** retained.
- Core lesson content, sentence IDs/text, the **174 scene turns**, all **232 saved evidence tasks**, and phase-2 production prompts/rubrics remain byte-equivalent in their compiled JSON representations. A new fixture records SHA-256 hashes of these phase-2 exports; phase-3 tests compare against it.
- Core content, assessment, room and production revisions are unchanged from completed phase 2. New activities are unsaved; no history migration is needed or performed.
- Canonical historical lesson inventory, retired-lab route guards, existing drafts, previous assessments and room histories remain intact.
- Other English levels, Pre-A1 and all six other languages retain their content. Regression tests include all six other-language A1 rendered integrations.

## Validation and limits

Final results across the same 34 distinct commands used in phase 2 plus the new phase-3 check: **34 PASS / 1 known baseline FAIL**. The aggregate `npm run validate:english-a1` suite also passed after the updates. Deterministic regeneration produced an identical generated-file SHA-256 hash.

The phase-3 test exercises the **real components**, mocking only native views, speech callbacks and persistence boundaries. It renders all 29 listening activities with failed/completed audio, incorrect/correct responses, both playback rates and local reset; all 20 read-only teaching previews; link actions across all 29 core lessons; and all 24 scripted branch paths, including self-check/reset. A persistence trap verifies zero optional evidence writes. It also checks route scoping, invalid IDs and phase-2 export hashes.

The older integration test now reports its actual 29 reading renders; the new listening renderer is tested separately rather than continuing to claim that rendering the old generic listening component tests the new screen. Two phase-1 listening assertions now inspect the unchanged **saved evidence** rather than the intentionally replaced optional tasks.

The sole remaining failure is the already-reproduced, unrelated German word-lab floor assertion: `138 >= 154` is false. No German content or threshold was changed to suppress it. React test renderer emits deprecation warnings; these are not test failures.

No device audio audition, native usability trial, learner study or empirical CEFR outcome validation was performed. Successful automated checks do not certify A1 proficiency. Speech is generated with the device speech engine; its real pronunciation and letter-name quality remain device-dependent.

### Reproducible validation commands

The following table records the final result for each distinct command (the corrected audit-fixes test was rerun successfully after pointing it at preserved evidence).

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `git diff --check` | PASS |
| `node scripts/verify-english-engine.cjs` | PASS |
| `node scripts/verify-english-four.cjs` | PASS |
| `node scripts/verify-english-lesson-flow.cjs` | PASS |
| `node scripts/verify-english-backup.mjs` | PASS |
| `node scripts/verify-lesson-assessment.cjs` | PASS |
| `node scripts/verify-progress-display.mjs` | PASS |
| `node scripts/verify-shared-level.cjs` | PASS |
| `node scripts/verify-level-resume.cjs` | PASS |
| `node scripts/verify-dialogue-room.cjs` | PASS |
| `node scripts/verify-word-lab-core.mjs` | Known baseline FAIL: German 138 < 154 |
| `node scripts/verify-english-supplement.cjs` | PASS |
| `node scripts/verify-english-a1.cjs` | PASS |
| `node scripts/verify-english-a1-integration.cjs` | PASS |
| `node scripts/verify-english-a1-audit-fixes.cjs` | PASS |
| `node scripts/verify-operator-speech.cjs` | PASS |
| `node scripts/verify-assessment-layout.mjs` | PASS |
| `node scripts/verify-lesson-stage-navigation.cjs` | PASS |
| `node scripts/verify-speaking-skip.cjs` | PASS |
| `node scripts/verify-seven-language-lesson-ui.cjs` | PASS |
| `node scripts/verify-six-prea1-practical.cjs` | PASS |
| `node scripts/verify-prea1-balance.cjs` | PASS |
| `node scripts/verify-narration-contract.mjs` | PASS |
| `node scripts/verify-recording-cache.mjs` | PASS |
| `node scripts/verify-level-restart.cjs` | PASS |
| `node scripts/verify-foreground-restart.cjs` | PASS |
| `node scripts/verify-english-a1-phase2.cjs` | PASS |
| `node scripts/verify-russian-a1-integration.cjs` | PASS |
| `node scripts/verify-german-a1-integration.cjs` | PASS |
| `node scripts/verify-french-a1-integration.cjs` | PASS |
| `node scripts/verify-spanish-a1-integration.cjs` | PASS |
| `node scripts/verify-turkish-a1-integration.cjs` | PASS |
| `node scripts/verify-arabic-a1-integration.cjs` | PASS |
| `node scripts/verify-english-a1-phase3.cjs` | PASS |
