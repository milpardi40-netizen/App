# Russian and English word-lab repair

Date: 2026-11-26. Separately authorized follow-up to `GERMAN-WORD-LAB-REPAIR.md`. Scope: Russian/English word-lab target/gloss data and its validation. No lesson/assessment edits, APK, commit, push or release.

## Result

| Language | Curated before | Curated after | Unchanged floor | Total learner cards after |
| --- | ---: | ---: | ---: | ---: |
| German (protected) | 154 | 154 | 154 | 803 |
| Russian | 105 | **116** | 113 | 1460 |
| English | 119 | **131** | 130 | 4281 |

The full default three-language verifier now passes **all 36 content checks**. Final regression run: **38 distinct successful commands, zero failures among those commands**. This is a result for the recorded checks, not a claim of complete linguistic coverage or absence of every possible app defect.

## Diagnosis and authoring decisions

The same two constraints found in the German repair apply here: some existing targets occur in valid beginner examples but lack standalone vocabulary glosses, while other historical targets have no usable exact-form beginner example. The matcher must not invent examples, accept a different inflection or use prefix matches to fill the count.

### Russian: seven recovered targets plus four missing numbers

Standalone Persian meanings were authored for seven existing targets whose exact forms already occur in the current course:

- мя́со — گوشت
- сын — پسر (فرزند)
- воскресе́нье — یکشنبه
- час — ساعت (مدت زمان)
- по́езд — قطار
- до́рого — گران
- о́чень — بسیار؛ خیلی

Four targets complete the beginner number sequence from 1 to 10: **два, четы́ре, шесть, во́семь**. Their glosses and exact examples already exist in the course. This gives 116 curated entries, rather than adding arbitrary filler until the floor of 113 is reached.

Seven old targets remain unresolved: до свида́ния, дочь, соба́ка, у́тро, у́лица, туале́т, язы́к. For example, the current farewell is just the target phrase itself, so it remains excluded by the existing no-bare-phrase rule.

### English: two recovered targets plus ten functional entries

Two existing targets are recovered with standalone Persian glosses:

- **month** — ماه; the course teaches it inside `per month`.
- **card** — کارت بانکی; the course teaches it inside `pay by card`.

Ten beginner targets already taught by actual course examples are added in their related groups:

- identity/spelling: **first name, last name, spell, address**;
- numbers: **eleven, twelve**;
- café: **sandwich, sugar**;
- directions: **turn left, turn right**.

Keeping the two direction chunks preserves their functional meaning instead of relying on an ambiguous isolated gloss of `right`. `office` was deliberately not recovered from `post office`: an exact token alone is not justification for teaching the wrong standalone sense.

English now has 131 curated entries and 44 unresolved historical targets. These unresolved entries are still printed by the verifier; meeting the floor does not mean the old target list is fully covered.

## Runtime and history boundaries

Only the Russian/English target lists and fallback gloss maps in `lib/languages/wordLabCore.ts` changed for this phase. The selection algorithm, beginner ceiling, exact-token/phrase matching and bare-target exclusion remain unchanged.

All 23 added curated entries obtain their example text, Persian translation and pronunciation from an existing Pre-A1/A1 course row. The established rules also allow meaningful short multiword utterances and number-practice sequences, not only verb-containing sentences. No new lesson rows were invented to fill counts.

All previous **105 Russian / 119 English curated IDs** and all **1453 Russian / 4279 English learner-facing word-card IDs** remain present. Existing frequency-tail cards promoted to the curated section keep the same learner-facing IDs. Only seven Russian and two English learner-facing IDs are new. Existing storage is not cleared or migrated. Order/example selection can change through the existing greedy matcher; preserving IDs does not freeze every prior example or order.

New hash guards verify that:

- all **seven complete course inventories** remain identical to their pre-repair versions;
- the full German core/card/unresolved payload remains identical;
- every previous Russian/English learner-facing ID remains present;
- every added curated item has the exact existing beginner source text, translation and pronunciation;
- all three floors remain unchanged.

## Verifier normalization issue revealed after the floor passed

After repairing the English count, the verifier reached a previously masked punctuation mismatch. Production folds curly double quotation marks, but the verifier did not. It incorrectly rejected existing examples such as `What does “street” mean?` even though the whole word is present.

The verifier now strips `„“”` alongside the quote punctuation it already stripped. The production matcher was not broadened. Regression cases check curly/guillemet quotes and Russian stress normalization, while keeping distinct words such as Küche/Kuchen and Tür/Türkei distinct. No token-boundary or level restriction was removed.

The original common verifier still defaults to **German + Russian + English**. It is not bypassed or narrowed. `npm run validate:word-lab` now runs that common verifier and both the German and Russian/English repair regressions.

The earlier German-only guard formerly protected the old Russian/English payloads exactly. Those were intentionally changed under this subsequent authorization, so the guard now compares against the new exact approved follow-up hashes. The historical fixture remains intact; the new test checks that its recorded pre-repair hashes match that older fixture. Thus the prior boundary is explicitly superseded, not silently discarded.

## Validation

`scripts/verify-russian-english-word-lab-repair.cjs` and `scripts/fixtures/russian-english-word-lab-repair.json` contain the reproducible repair guard and compact before/after snapshots.

Final results: 38 distinct PASS, 0 FAIL. Full local logs are in `.cache/ru-en-word-lab-fix/validation.json` and `validation/` (cache, not durable deliverables). The command list follows. React renderer deprecation warnings are not failures. No device audio audition or learner trial was performed; these checks do not establish proficiency or certify complete vocabulary coverage.

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
| `node scripts/verify-word-lab-core.mjs` | PASS |
| `node scripts/verify-german-word-lab-repair.cjs` | PASS |
| `node scripts/verify-russian-english-word-lab-repair.cjs` | PASS |
| `npm run validate:word-lab` | PASS |
