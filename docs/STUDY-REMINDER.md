# Study reminder implementation and device acceptance

## Scope and known limits

The Android implementation is a local Expo module, `modules/milo-study-reminder`.
It deliberately replaces the Android Expo notification scheduler for study reminders only.
It does not fix an identified exception in Expo: the old build discarded that exception,
so its exact device-specific cause is still unknown. Native Android scheduling removes
that path and adds persistent diagnostics rather than asserting a guessed root cause.

**A new native APK is required.** A JS/web refresh or OTA update cannot add this module
to build 176. On older Android binaries the UI explicitly reports `update-required`
when enabling/testing; disabling the old reminder is still allowed.

No educational content, chat service, push credentials or exact-alarm permissions are changed.

## Android behavior

- Explicit opt-in; no permission dialog on startup or resume.
- Creates `milo-study` before requesting notification permission on Android 13+.
- One private, immutable PendingIntent backed by `AlarmManager.setAndAllowWhileIdle`.
  This is intentionally **inexact**: delivery can be delayed by Doze/battery restrictions.
- No running JS, foreground service, FCM, server, login or network required for delivery.
- Each delivery schedules the next local calendar date (not `now + 24 hours`).
- Native SharedPreferences are authoritative for enabled/time; existing AsyncStorage
  preferences migrate without changing lesson progress. The study-day marker is mirrored
  so a transient write failure can be repaired on the next app resume.
- Completing a lesson persists the local day, removes a visible daily reminder, and
  moves the pending alarm to the next day. The receiver independently checks the day
  again, suppresses duplicate delivery and discards yesterday's delayed alarm.
- Reschedules after boot, app update, system clock/timezone change and app resume.
  A same-day overdue alarm is delivered (unless already studied/notified), not silently
  moved to tomorrow when the app is reopened while Android has delayed it.
- A fixed notification ID and `lastNotifiedDay` prevent multiple daily nudges if the
  time is edited after a reminder has already appeared.
- Application-level denial and channel-level blocking have separate recovery messages.
- Disabling cancels the daily and test alarms and their visible notifications.
- The explicit Android test posts immediately using a separate notification ID; it
  does not change daily opt-in/time or count as a daily reminder. The previous ten-second
  inexact-alarm test could be delayed substantially by Android and was not a valid timer promise.
- New notification channels use HIGH importance. Existing channel preferences remain
  under system/user control: the app does not bypass a blocked/muted channel. Repeated
  tests alert again instead of silently updating an existing notification.
- The settings card shows the next native alarm time, last daily/test post time, app/channel
  blocking, sound/DND and battery restrictions, with notification/battery settings links.
  A successful notify call means submitted to Android, not proof the person heard/saw it.
- Tapping opens the app normally, preserving app-lock, registration and saved-page guards.
- Native errors are kept in preferences and logcat (`MiloStudyReminder`); bridge errors
  have a separate local diagnostic key and appear in the settings card.
- Android **Force stop** disables alarms/receivers until the user opens the app again.
  No app can promise delivery while force-stopped, the phone is powered off, notifications
  are denied, or an OEM blocks background execution. The UI describes the battery/force-stop limit.

## iOS compatibility

Uses Expo DATE requests for the next 30 local dates, renewed on foreground and lesson
completion. Dated requests allow today's notification to be removed after study instead
of incorrectly claiming that a repeating DAILY trigger can skip it. The UI explicitly
states the 30-day window. Other notification owners are never cancelled. A capacity check
respects iOS's 64-pending-request limit and fails explicitly rather than dropping other
features' notifications. Foreground study notifications are not suppressed as chat banners.

## Automated checks

`npm run validate:study-reminder` covers preference/migration and bridge behavior using
mocks, native wiring/manifest invariants, permission denial, channel blocking, error
reporting, concurrent completion/time changes, transient native marker-write recovery,
legacy binaries, web, iOS replacement and isolation from chat notifications.

`npm run typecheck` checks TS and UI integration. Expo autolinking must resolve
`expo.modules.milostudyreminder.MiloStudyReminderModule`.

These checks **do not execute Android's AlarmManager or constitute a physical-device test**.
A Java/Android SDK build and the phone checks below are required before claiming device success.

## Required acceptance on a newly built Android APK

Use an Android 13+ device (and ideally the user's original OEM/model), with offline mode
as well as online. Keep logcat filtered to `MiloStudyReminder` for failures.

1. Fresh install: reminder off; no unsolicited permission prompt.
2. Turn on; grant POST_NOTIFICATIONS. Verify enabled survives leaving/reopening settings.
3. Press test; immediately check the notification shade while foregrounded and compare
   the last-test-post timestamp. Repeat while an earlier test notification is still visible;
   it should alert again unless system sound/DND/channel settings prevent it. Verify the
   channel is **یادآور مطالعه**, not chat.
4. Repeat the immediate test offline. Test the **daily scheduled reminder** with the app
   backgrounded/swiped out of Recents. Tap the result; app-lock and saved-page behavior
   must remain intact. Swiping away is not Settings → Force stop.
5. Disable the channel in the provided system settings link; return and verify the
   channel-specific warning. Re-enable it and verify recovery without reinstalling.
6. Deny app notification permission; enabling/testing must explain permission denial,
   not report success or repeatedly re-prompt a permanently denied grant.
7. Set the chosen time a few minutes ahead using a test build/debug setting or device
   clock; verify one daily notification. Change time repeatedly: no duplicate daily nudge.
8. Before that time, complete a real lesson; verify today's pending alarm moves to
   tomorrow and no daily nudge appears today. On the following day without study, it should.
9. After delivery, change the selected hour to a later hour today; no second daily nudge.
10. Post a test, then disable the reminder: visible test/daily notifications and pending
    daily/legacy test alarms are cancelled. Reopen after a delayed same-day daily alarm
    was due: it appears once if no lesson was completed, rather than being skipped.
11. Re-enable, reboot, unlock, and verify the next reminder without opening the app.
12. Change timezone and clock (including a DST boundary); verify local wall-clock time
    and that a stale previous-day alarm is not delivered as today's nudge.
13. Test battery saver/Doze; allow for system-imposed delay rather than asserting exact seconds.
14. Force-stop: verify the documented limitation; reopen and confirm scheduling repairs.
15. Upgrade from build 176 with enabled/disabled settings; ensure no legacy duplicate,
    preserved selected time/study marker and no effects on lesson progress or chat settings.
