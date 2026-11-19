# Learner progress: what the numbers mean

All six courses use `loadCourseSnapshot` for their paths and profile. The denominator is the current catalogue of *playable lessons* in that level, not its number of units, self-assessment prompts or extra syllabus topics. A course outside an APK's language scope is not included in its profile.

- **Completed / total** counts distinct, known completed lesson IDs. A replay, placement or a saved intro is not another completion. Unlock conditions still use whole completions.
- **The bar** adds saved positions in unfinished lessons. The ten stages have equal weight; the current sentence/check stage can have fractional credit. Completed long-lesson chunks and the sentence cursor cover the *same* work; we take the greater coverage, not their sum. A saved final stage never awards the last tenth until completion. This measures course traversal, not mastery or CEFR certification.
- **Time and streak** use recorded local calendar dates. Only measured, focused study time is added to minute totals. A day can contain recorded practice but no measured minutes. Historical duration estimates are shown separately. Global streaks use the union of active dates across courses, including the completion streak retained from previous versions.
- **Reviews** separate deck size, due cards and actual ratings. A lapse is a review even though the scheduler resets repetitions. New per-card day counters merge idempotently across writes/backups; old SRS records with lapses provide only a lower bound. An old review without a date is not assigned to today.
- **Scores** come from submitted or recognized answers. Optional practice rounds, pronunciation self-marks, drafts, best podcast quizzes, lesson checks and level exams are distinct records. Skips/silence don't become zero scores. Old records that counted available rather than answered questions do not feed a made-up accuracy percentage. No new recording, transcript or draft content is collected by the summary.
- Focus, successful local writes/restore/sync, returning to the foreground and cross-tab storage events invalidate the applicable views. Refresh does **not** initiate a cloud write. Stored histories keep their original course scope; device-only practice is not promised to sync to other devices.

## Regression checks

`npm run validate:progress` drives the six real storage implementations on the Android and web code paths (including an unresponsive account, session-only progress, completion/replay, cross-language streaks, review merges, isolation, and relaunch). `node scripts/verify-english-reset.mjs` and `node scripts/verify-nonenglish-restart.cjs` additionally cover failed and overlapping saves.

For the mobile-width browser check, run `npm run build:web:learner`, then `CHROME_BIN=/path/to/chromium node scripts/verify-live-progress-browser.cjs` with `playwright-core` available on the Node module path. This loads **the exported app** offline in a disposable browser context, checks pixel widths/edges in both writing directions, advances a real lesson and checks the library and profile after navigation. No fixtures are bundled into the app.
