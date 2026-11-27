# English A1 audit — phase 2: staged teaching and functional transfer

Date: 2026-11-26. Continues `ENGLISH-A1-AUDIT-FIXES.md`. Scope remains **English A1 only**.

## What changed

### Smaller teaching steps for lessons 9 and 21

`lib/englishA1Scaffolding.ts` authors exactly two micro-lesson sequences:

- Lesson 9, everyday routines: four steps — I/you habits; positive he/she forms; do/does questions; negatives.
- Lesson 21, yesterday/tomorrow: five steps — was/were; worked/studied; one irregular form went; did questions/negatives; then going-to plans with an explicit temporal transition.

Each step has a short explanation, two examples with optional playback, an example-hiding action for retrieval, a short recall prompt, and a three-choice formative check with immediate explanatory feedback. Only one contrast is visible at a time. Previous-step navigation and review are supported. The original full lesson overview is available on request rather than expanded by default.

The real English lesson screen uses this component in **both the introduction and grammar stages** for these two lessons. Other lessons retain their normal teaching/pattern presentation. This changes presentation/scaffolding, not the number of sentence slots or top-level stages. The sentences still contain all the original structures; this is not a claim that their inherent linguistic complexity has disappeared.

These micro-checks do not write learning records, award mastery, or gate the main lesson's Continue button. A correct local response enables the next micro-step only; learners may leave the optional guide at any time.

### Twenty-nine functional reading-transfer activities

`docs/english-a1-design/runtime/applications.json` supplies one new optional reading activity per core lesson. These **replace** the previous optional reading passages that duplicated saved evidence; the total remains 58 optional comprehension activities (29 listening + 29 reading). Listening activities and the 232 saved lesson-evidence questions are unchanged in this phase.

The new data include identity/form cards, schedules, a shop's missing price, stock/size matching, an order-correction exchange, route instructions, a changed appointment, an explicitly accepted invitation, a room advertisement, ticket data and message sender/recipient distinctions. Every task includes its own necessary source data and explanatory feedback. Activities use previously introduced goals in new data, rather than only replacing a name in an echo sentence.

The English screen labels these readings as optional application to fresh information. Other languages keep their existing `StarterA1Skill` heading by default.

### Twenty-nine task-specific production prompts and rubrics

The durable `design.json` now provides a functional writing task, a spoken interaction/retrieval prompt and three specific self-check criteria for each core lesson. Examples:

- Shopping: identify a missing price and payment information rather than inventing the unknown data.
- Café: preserve the requested drink and preference while politely correcting an incorrect repeat-back.
- Appointments: confirm the new day and time together rather than combining old and new details.
- Invitations: distinguish proposing an alternative from assuming agreement.
- Renting: the advertisement is explicitly included; ask for the missing rent and viewing time rather than relying on an absent external advertisement.
- Forms/spelling: appropriate short fields are allowed instead of demanding artificial full sentences.
- Health: fictional symptoms and language-help requests only; no diagnosis, drug or dosage recommendation.

Speaking prompts support a partner or solo two-role rehearsal. These are task-based **practice**, not automatic evaluation of spontaneous interaction. The rubrics check task achievement, correct use of targeted forms and consistency of the relevant facts; they are not a generic repeated checklist.

The English A1 production panel is accurately titled “کاربرد و تولید کوتاه” rather than implying all tasks are unconstrained essays. It states that reaching the word count is not proof of correctness. Production remains self-checked and ungraded; the app does not validate a free answer merely because the learner ticks a box.

## Preservation and versioning

- All **29 lesson IDs, order, 1450 English/Persian sentence texts and sentence IDs** are preserved. No top-level stage is added or removed.
- Saved evidence tasks, their assessment revision, dialogue rooms, content revision, chunk keys and sentence review schedules are unchanged from phase 1.
- Only the production assignment namespace changes: `en-a1-production-transfer-v2`, via `englishA1ProductionRevision`. This deliberately does not reuse `englishA1SentenceRevision`.
- Old unversioned and phase-1 production drafts/checklist ticks remain in their previous keys; they do not silently populate a different assignment. Existing lesson completions/resume/history are not reset.
- Other English levels and all six other language curricula are protected by existing inventory assertions. Shared components gain optional English-only display labels; their defaults, draft keys and existing other-course wiring remain unchanged.
- The offline generator consumes the durable application JSON and design source. Repeated generation is deterministic.

## Tests

`npm run validate:english-a1` now includes `verify-english-a1-phase2.cjs` in addition to the existing data, integration and phase-1 audit tests.

The new test actually renders and exercises all nine micro-steps: hidden/full overview, examples and retrieval, wrong/right responses, next-step guarding, backward/review navigation and authored speech callbacks. It checks the 29 unique transfer readings, separation from saved evidence, 29 distinct production rubrics, task-local source information and production-only revision boundaries.

The existing integration test renders all 29 updated production tasks using the actual screen prop expressions, verifies preservation of both generations of old draft keys, and still executes 58 complete room runs and the optional comprehension renderers. It also verifies unchanged production labels/draft namespaces outside English A1.

Final validation: **33 successful distinct check commands**, including typecheck, deterministic regeneration, English regression suites, restart/resume/history checks and rendered A1 integrations for Russian, German, French, Spanish, Turkish and Arabic. The same pre-existing `verify-word-lab-core.mjs` German floor failure (138 < 154) remains; phase 1 reproduced it on the untouched baseline. No German content or recorded floor was altered to hide it. Local logs: `.cache/english-a1-fixes/phase2-validation.json` and `.cache/english-a1-fixes/phase2/`.

No APK build, native-device audio judgment or learner-outcome trial was performed.

## Follow-up

[Phase 3](ENGLISH-A1-AUDIT-PHASE3.md) now implements the supplement mapping, fresh listening and selected scripted interaction practice. Learner trials and empirical calibration remain outstanding. The list below records what remained at the end of phase 2.

## Remaining work at the end of phase 2

- Map the separate supplemental units explicitly to prerequisite, review or optional-extension roles in the main route.
- Expand independent listening/interaction transfer and assess the balance using actual learner behavior.
- Pilot the revised dense lessons and production tasks with post-Pre-A1 learners; calibrate time and support from observed errors.

This phase does not turn the internal final check into a comprehensive four-skills proficiency exam or establish CEFR certification.
