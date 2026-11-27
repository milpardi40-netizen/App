# Russian lesson one: practical communication enrichment

Historical lesson-one iteration. Superseded by the all-31 content pass documented in `russian-pre-a1-practical.md` (four-turn dialogue and three main checks per lesson).

Scope: `ru-pre-01-hello` only, within the existing ten stages (situation, core expressions, listening, shadowing, sentence building, vocabulary, usage, checks, speaking checkpoint, dialogue room). No pages removed, merged, reordered or redesigned.

## Content

- Goal: greet, ask how a friend is, answer, ask back and close a friendly exchange. Thanks and acceptance/refusal remain separate practice. Polite greeting and apology have separate contextual checks, rather than being forced into the same dialogue.
- Original eight expression records and their IDs are preserved. The thanks/response record is explicitly labelled as an exchange, with **two distinct vocabulary entries**, not one combined word.
- Two appended phrases reuse known words: `Да, спаси́бо.` and `Нет, спаси́бо.` Contrast one variable at a time. Two further appended records now teach friendly check-in `Как ты?` and `Хорошо́, спаси́бо. А ты?` before the dialogue uses them. These introduce gender-independent expressions; `Хорошо́` here is an adverb, not a neuter adjective. The original ten record IDs remain stable; all twelve stay below the chunking threshold.
- Listening choices describe communicative intentions rather than literal translations, for this lesson only.
- Shadowing has a short stress cue. Building starts guided; the acceptance/refusal phrases (records 9–10) omit the complete target model and use a Persian pattern. This is reduced support, not an unassisted production test.
- Usage patterns and the existing usage card teach greeting register, thanks/response and acceptance/refusal without unrelated grammar.
- Eight checks cover greeting register, apology, farewell, response to thanks, refusal, acceptance, replying to a check-in and the purpose of asking back. Existing deterministic choice rotation still applies.
- Six connected alternating dialogue turns use only taught words: greeting/check-in, answer and reciprocal question, answer, hope to meet again, acknowledgement/farewell, farewell. This replaces the earlier low-content greeting/thanks/farewell exchange after user feedback. The lesson room and direct conversation route use the same authored source, replacing the previous untaught name/student/Russian-speaking override.
- Existing room guided/cued/exam modes and optional review remain available; they were not newly invented by this change.
- Speaking checkpoint remains a separate stage. Its description explicitly calls it sample reproduction, not a definitive pronunciation or conversational-ability score. Recognition/transcript matching cannot certify those abilities. The room's hidden-text exam remains available for recall.

## Compatibility

- Only lesson one's authored check revision changes. Its obsolete answers are retired while stage, sentence position and other valid state are retained. Other 30 Pre-A1 definitions are SHA256-snapshotted; saved lesson-two and A1 answers are explicitly tested.
- Room history uses an optional content-revision suffix for lesson one only, so earlier unrelated-dialogue scores do not enter its new trend. Old records are retained. All other room history keys stay unchanged.
- Masculine/gender-independent audits remain mandatory. The per-expression Persian bridge now receives the existing Pre-A1 masculine-only flag, consistent with the builder and summary.
- New phrases join normal local spaced review on subsequent lesson completion. No progress wipe or retroactive claims of learning.

## Verification

Passed:

- `npm run validate:russian-pre-a1-masculine` (31 lessons; higher-level snapshots; other-30 content snapshot; room parity/known words/roles; targeted session revision)
- `npm run validate:russian` (91 checks; 1,852 Russian expression records)
- `npm run validate:dialogue-room` (including default and revision-specific history load/save keys)
- `npm run validate:recycling` (38 checks; 202 distinct Pre-A1 surface words, 60% reused across lessons)
- `npx tsc --noEmit`
- `git diff --check`
- Static web export: 93 routes; preview restarted against the exported files.

No manual microphone/browser speech test performed. Device/browser recognition quality and real pedagogical effectiveness require user testing. Existing unrelated A1 prerequisite gap (`мама`) remains documented by the course validator, not silently changed.
