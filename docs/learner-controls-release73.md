# Requested learner controls (after release 72)

## Scope

- Keep awake only while the app is foreground/active; release on background or teardown. This uses Expo's existing small native module and does not intercept the power key.
- `رد شو` beneath the shared microphone. Owners supply an actual one-item advance. It cancels pending permissions/auto-start/retry timers and aborts capture; late results do not earn an attempt, score, XP or spoken-activity credit. Applies to guided sentences, shadowing, vocabulary, speaking tests, dialogue turns/error review, word labs and spaced-review speech gates.
- Adjacent current-level/current-lesson restart controls on seven languages' home and selected-level pages. A level restart resets the saved attempts and chunk markers of **all lessons in that selected level**, sets its first lesson as resume point and starts there. Lesson restart affects that attempt/chunks only. Historical completions, word mastery, review schedules and other levels/languages are retained. Fresh route tokens also clear in-memory drills, evidence and modal state when restarting the same URL.
- Shared completion modal retains all statistics, streak, level result, medals and review link. Bounded by window height/safe areas, wrapping statistics and a scrollable body; restart/continue remain accessible in the action area.
- Russian content changes limited to family vocabulary/necessary agreement in Pre-A1 lessons 03/05: `Э́то моя́ ма́ма.`, `Э́то моя́ сестра́.`, `Она́ ма́ма.`, `Она́ сестра́.` The 31 lessons/252 expression IDs, ten stages, question revision and saved answers remain stable. A1–C1 snapshots remain unchanged.

## Speech investigation and limits

Compared release71 (`73bcaf51dddbedcbfa7877427256032352b35a29`) and release72 (`003d9d9`) shared SpeakCheck and native configuration. Those releases have the same recognizer language/network settings; their SpeakCheck difference is room presentation, not a newly introduced remote speech endpoint. Content length and screen/audio lifecycle were examined instead of attributing the report to VPN alone.

Fixed concrete lifecycle hazards: await TTS stop before native capture (previously fire-and-forget), cancel owned microphone and pending work on navigation blur/background, invalidate permission continuations on skip, and ignore late callbacks. Android now requests `EXTRA_PREFER_OFFLINE` from the existing installed recognition service, while keeping `requiresOnDeviceRecognition: false` so missing device packs are not a hard failure. No engine, language-pack download, forced recognizer package, server or large model was added. The OS service can ignore this preference.

**No physical phone / Iran network / VPN A/B test has been performed in this workspace.** Automated mocks prove lifecycle/control behaviour, not end-to-end network availability or acoustic pronunciation accuracy. On a phone, compare the same phrase in both installed versions with VPN off/on, check first-run permission, navigation away during capture, a skip during capture, and background/foreground. Do not call VPN independence confirmed until this test succeeds.

## Validation

`validate:learner-controls` exercises real foreground hook/SpeakCheck rendering, asynchronous permission and audio-release cancellation, late results, selected-level dispatch using all seven real course inventories, scoped chunk writes, same-route tokens, and small/landscape modal trees. Native recognizer/persistence dispatches in those focused tests use spies. Existing persistence, progress, language-isolation, Russian content, English flow, dialogue-room and narration tests complement them. Requested APK CI runs the new control suite before assembling each native flavour.

Two old assertions were reconciled against release72, not expanded by unrelated content edits: Russian word-lab floor 118 was stale (actual release72=113, now=115); Russian total in the Turkish isolation test was stale at1848 (release72 and current=1852). The scoped masculine audit now allows only mother/sister/она/моя in lessons03/05 and retains higher-band hashes and all other restrictions.
