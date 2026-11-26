# Lesson dialogue coaching

## Available now

- **Guided:** lesson text and translation, alternating operator and learner turns.
- **Cued:** learner sees the meaning first; the exact lesson sentence is revealed only on request. This is recall practice, not semantic evaluation of free-form answers.
- **Exam:** target text and coaching help stay hidden during the current turn.
- After 6.5 seconds on a learner turn, a quiet help panel becomes available. It never interrupts speech or plays audio automatically. Help can also be requested immediately.
- Hint, full example, and genuinely slower sample narration use existing lesson content. During sample playback the recogniser unmounts, the learner watchdog pauses, and recognition resumes after playback. A timeout recovers from a missing playback callback.
- The report distinguishes transcript similarity from pronunciation, fluency and meaning. No recognised speech means no numeric score or saved fake zero.
- Next steps come from attempted/skipped turns and transcript differences. Review practice does not overwrite the original session result.
- Trends compare the same practice path only. Legacy sessions count as guided. Stored additions are the path and assisted-turn count; no new audio or transcript persistence is introduced.

## Explicitly unavailable

Open-ended, reactive AI conversation and semantic/acoustic assessment are **not connected**. The free path is visibly unavailable, not a simulated AI feature. `lib/paidAI.ts` intentionally disables paid AI; this change does not alter that policy or call a paid endpoint.

Before enabling a real conversation service: perform the required cost/privacy/retention review, obtain explicit consent for the actual data flow, implement authenticated and rate-limited server requests, validate structured outputs and language/level constraints, handle cancellation/timeouts, and verify deployment end to end. Do not treat transcript matching as acceptance of alternative correct answers. The existing browser/device recogniser may itself require an internet connection.

## Verification

`npm run validate:dialogue-room` covers path selection, exam help isolation, hidden targets, requested hints/examples, microphone suspension during slow samples, assisted-turn counts, mode-specific trends, review, silent attempts and restart persistence. Platform speech, microphone permissions and reduced-motion behaviour still require real-device/browser checks.
