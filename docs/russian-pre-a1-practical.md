# Russian Pre-A1: content-only practical pass (31 lessons)

## Scope and constraints

This pass follows the user's latest instruction: change content only, not the original ten-page structure or exercise controls. All 31 Pre-A1 lessons have individually authored plans in `lib/languages/russianPreA1Practical.ts`. The other languages, Russian A1–C1 curriculum and higher-level gender cards retain their audited snapshots. Earlier accepted session changes in this branch remain included in the APK build.

The following remain stable: all 31 lesson IDs/order, all 252 expression IDs/order, 12 expressions in lesson one and eight in each other lesson, the same ten stages and their order, UI layout, progress keys, and original useful vocabulary entries. Some expression texts are now in context rather than isolated words.

## Content changes

- Each lesson has a small, distinct capability goal and a specific scene.
- Early isolated nouns, adjectives, numbers and verbs receive phrase/sentence contexts (requests, identification, descriptions, lesson numbers, preferences), retaining linked word meanings and Persian reading guides.
- Each plan identifies a one-variable contrast and a short usage/pronunciation tip; the contrast appears beside its actual examples and on the existing usage page.
- Every lesson has a short, alternating four-turn conversation coherent with its scene. Later shopping now includes an actual price answer; classroom dialogue includes a reply after repetition; object-finding stays on the same lost item.
- Every Russian word form in a dialogue occurs in the current or an earlier lesson's expression text. No hidden room-only name/student/quantity content. Both room entry points resolve to the same authored material.
- Each lesson's three main checks comprise one retained original check and two individually authored contextual checks: an appropriate conversational response and understanding intent/use. There are 62 new contextual checks, not 62 identical translation questions.
- Extra practice is explicitly optional: exchange roles and repeat with text, Persian cue, then from memory. These are content instructions using existing room modes, not a claim that a new adaptive engine was implemented.
- Existing usage cards quote actual current examples and carry the lesson's short note. Masculine/gender-independent restrictions remain mandatory across all rendered content.

## Progress and limits

Pre-A1 check revision is `ru-pre-a1-practical-v6`. Existing lesson location is preserved; only obsolete local question answers are retired on read. A1's revision stays unchanged. Pre-A1 dialogue histories receive the content revision suffix so new dialogues are not compared with old unrelated dialogues; original runs are not deleted.

This is **not** an exercise-engine redesign: listening still has its existing autoplay behavior, main Continue remains skippable, speech checkpoint still uses its existing recognition/transcript matching, and the generic final celebration remains unchanged. Optional self-practice does not certify mastery. Independent speaking ability, acoustic pronunciation and pedagogy require human/device testing. Do not describe every previously listed weakness as solved by this content-only pass.

## Verification

Passed before APK dispatch:

- `validate:russian-practical`: 31 authored plans; stable ID snapshot; in-context contrasts; 62 contextual checks; cumulative taught-form coverage; alternating roles; source parity; revision isolation; ten-stage presence.
- `validate:russian`: 91 course/flow/session checks, 1,852 Russian expression records overall.
- `validate:russian-pre-a1-masculine`: all Pre-A1 surfaces; A1–C1 lesson, gender-card and grammar snapshots; session preservation.
- `validate:gender-cards`: 55 English and 93 Russian linked cards.
- `validate:dialogue-room`: guided/cued/exam and versioned history behavior.
- `validate:recycling`: 201 distinct Pre-A1 surface forms; 120 (60%) recur across lessons.
- `validate:content`, `validate:requested-updates`, `typecheck`, `git diff --check`.

The existing unchanged A1 prerequisite gap (`мама`) remains documented by the course validator. No manual microphone test has been performed.

## APK method

Release `milo-requested-71` and successful Actions run `45776474519` were inspected. This checkout's `.github/workflows/apk-requested.yml` is byte-identical to that release's workflow. Reuse that workflow on the current Arena branch, without altering signing, application IDs, ARM ABIs, flavour separation or upgrade verification. The default no-login build set is `2update.apk`, `5update.apk`, `english.apk`, `AdminApp.apk`, plus admin web. Only `2update.apk` exposes Russian in its default language scope. The workflow also registers the release using its existing update process and keeps five releases; it is not a merge/deployment to main.
