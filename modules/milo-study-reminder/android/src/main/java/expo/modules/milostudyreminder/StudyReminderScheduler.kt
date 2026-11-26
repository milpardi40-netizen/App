package expo.modules.milostudyreminder

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/** One native, inexact wall-clock alarm. No network, FCM, exact-alarm grant or running JS. */
internal object StudyReminderScheduler {
  const val CHANNEL = "milo-study"
  const val ALARM_ACTION = "milo.study.REMIND"
  const val TEST_ACTION = "milo.study.TEST"
  private const val ALARM_ID = 7241
  private const val TEST_ID = 7242
  private const val PREFS = "milo_study_reminder_native_v1"
  private fun prefs(c: Context) = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
  private fun alarms(c: Context) = c.getSystemService(Context.ALARM_SERVICE) as AlarmManager
  private fun manager(c: Context) = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
  private fun day(date: Date = Date()) = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(date)

  @Synchronized fun settings(c: Context): String? {
    val p = prefs(c)
    if (!p.getBoolean("initialized", false)) return null
    return JSONObject().put("enabled", p.getBoolean("enabled", false))
      .put("hour", p.getInt("hour", 20)).put("minute", p.getInt("minute", 0))
      .put("lastStudiedDay", p.getString("lastStudiedDay", ""))
      .put("nextScheduledAt", p.getLong("nextAt", 0)).toString()
  }

  private fun commit(ok: Boolean) { check(ok) { "Study reminder settings could not be saved" } }

  fun channel(c: Context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Recreating an existing channel preserves the user's system preferences.
      manager(c).createNotificationChannel(NotificationChannel(CHANNEL, "یادآور مطالعه", NotificationManager.IMPORTANCE_DEFAULT).apply {
        description = "یک یادآوری روزانه برای ادامهٔ درس"
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 90)
      })
    }
  }

  private fun permissionStatus(c: Context): String? {
    if (!NotificationManagerCompat.from(c).areNotificationsEnabled()) return "permission-denied"
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && manager(c).getNotificationChannel(CHANNEL)?.importance == NotificationManager.IMPORTANCE_NONE) return "channel-blocked"
    return null
  }

  private fun intent(c: Context, test: Boolean, at: Long = 0): PendingIntent {
    return PendingIntent.getBroadcast(c, if (test) TEST_ID else ALARM_ID,
      Intent(c, StudyReminderReceiver::class.java)
        .setAction(if (test) TEST_ACTION else ALARM_ACTION).putExtra("at", at),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  private fun setAlarm(c: Context, at: Long, test: Boolean = false) {
    // A learning nudge is not an alarm clock. Android may delay it under Doze;
    // deliberately avoid setExact / SCHEDULE_EXACT_ALARM and their SecurityException.
    alarms(c).setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, intent(c, test, at))
  }

  private fun cancel(c: Context, test: Boolean = false) {
    alarms(c).cancel(intent(c, test))
    NotificationManagerCompat.from(c).cancel(if (test) TEST_ID else ALARM_ID)
    if (test) commit(prefs(c).edit().putLong("testAt", 0).commit())
  }

  private fun next(c: Context) {
    val p = prefs(c)
    val now = System.currentTimeMillis()
    val target = Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, p.getInt("hour", 20))
      set(Calendar.MINUTE, p.getInt("minute", 0))
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }
    // Calendar.add, not +24h: preserve local wall time over DST and midnight.
    if (target.timeInMillis <= now || p.getString("lastStudiedDay", "") == day(target.time) || p.getString("lastNotifiedDay", "") == day(target.time)) {
      target.add(Calendar.DAY_OF_YEAR, 1)
    }
    val at = target.timeInMillis
    setAlarm(c, at)
    commit(p.edit().putLong("nextAt", at).commit())
  }

  @Synchronized fun configure(c: Context, json: String): String {
    val value = JSONObject(json)
    val hour = value.getInt("hour")
    val minute = value.getInt("minute")
    require(hour in 0..23 && minute in 0..59) { "Invalid reminder time" }
    val enabled = value.getBoolean("enabled")
    if (enabled) {
      channel(c)
      permissionStatus(c)?.let { return it }
    }
    val p = prefs(c)
    val previous = settings(c)
    // Never overwrite a lesson completion with an older settings-card snapshot.
    val nativeDay = p.getString("lastStudiedDay", "") ?: ""
    val studied = if (p.getBoolean("initialized", false) || nativeDay.isNotEmpty()) nativeDay else value.optString("lastStudiedDay", "")
    commit(p.edit().putBoolean("initialized", true).putBoolean("enabled", enabled)
      .putInt("hour", hour).putInt("minute", minute).putString("lastStudiedDay", studied).commit())
    try {
      if (enabled) next(c) else {
        cancel(c)
        cancel(c, true)
        commit(p.edit().putLong("nextAt", 0).commit())
      }
    } catch (e: Exception) {
      // Restore the previous preference and alarm on a failed time change.
      val old = previous?.let { JSONObject(it) }
      p.edit().putBoolean("enabled", old?.optBoolean("enabled") ?: false)
        .putInt("hour", old?.optInt("hour", 20) ?: 20)
        .putInt("minute", old?.optInt("minute", 0) ?: 0).commit()
      try { if (p.getBoolean("enabled", false)) next(c) else cancel(c) } catch (_: Exception) { /* original error is retained */ }
      throw e
    }
    clearError(c)
    return if (enabled) "scheduled" else "disabled"
  }

  @Synchronized fun reconcile(c: Context): String {
    if (!prefs(c).getBoolean("enabled", false)) return "disabled"
    channel(c)
    // Keep renewing while blocked too, so enabling system notifications can recover
    // without waiting for another app launch (including after a reboot).
    next(c)
    val status = permissionStatus(c) ?: "scheduled"
    if (status == "scheduled") clearError(c)
    return status
  }

  @Synchronized fun markStudied(c: Context, studied: String) {
    require(Regex("\\d{4}-\\d{2}-\\d{2}").matches(studied)) { "Invalid study day" }
    val p = prefs(c)
    // Explicit completion wins even if the user moved the device calendar backwards.
    commit(p.edit().putString("lastStudiedDay", studied).commit())
    // Cancel a visible reminder as well as today's pending alarm.
    NotificationManagerCompat.from(c).cancel(ALARM_ID)
    if (p.getBoolean("enabled", false)) next(c)
  }

  @Synchronized fun test(c: Context): String {
    channel(c)
    permissionStatus(c)?.let { return it }
    val at = System.currentTimeMillis() + 10_000
    setAlarm(c, at, true)
    commit(prefs(c).edit().putLong("testAt", at).commit())
    clearError(c)
    return "test-scheduled"
  }

  @Synchronized fun receive(c: Context, incoming: Intent) {
    val p = prefs(c)
    if (incoming.action == TEST_ACTION) {
      val at = incoming.getLongExtra("at", 0)
      if (at > 0 && at == p.getLong("testAt", 0) && permissionStatus(c) == null) {
        show(c, true)
        commit(p.edit().putLong("testAt", 0).commit())
      }
      return
    }
    if (incoming.action != ALARM_ACTION) {
      reconcile(c) // boot, app update, clock or timezone changed
      return
    }
    if (!p.getBoolean("enabled", false)) return
    val at = incoming.getLongExtra("at", 0)
    // Reject stale deliveries and don't fire yesterday's delayed nudge today.
    if (at <= 0 || at != p.getLong("nextAt", 0)) return
    if (at > System.currentTimeMillis() + 1000) { next(c); return }
    try {
      val today = day()
      if (day(Date(at)) == today && p.getString("lastStudiedDay", "") != today && p.getString("lastNotifiedDay", "") != today && permissionStatus(c) == null) {
        show(c, false)
        commit(p.edit().putString("lastNotifiedDay", today).commit())
      }
    } finally {
      next(c)
    }
  }

  private fun show(c: Context, test: Boolean) {
    channel(c)
    val launch = c.packageManager.getLaunchIntentForPackage(c.packageName)
      ?: throw IllegalStateException("Application launch intent is unavailable")
    // Open the app normally; never bypass the lock, registration or saved-page guards.
    val tap = PendingIntent.getActivity(c, if (test) TEST_ID else ALARM_ID, launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val icon = c.resources.getIdentifier("notification_icon", "drawable", c.packageName)
      .takeIf { it != 0 } ?: android.R.drawable.ic_popup_reminder
    val notification = NotificationCompat.Builder(c, CHANNEL)
      .setSmallIcon(icon).setContentTitle(if (test) "آزمایش یادآور مطالعه" else "وقت یک درس کوتاه")
      .setContentText(if (test) "یادآور روی این گوشی کار می‌کند." else "اگر امروز درس نخوانده‌ای، چند دقیقه تمرین کن.")
      .setContentIntent(tap).setAutoCancel(true).setOnlyAlertOnce(true)
      .setPriority(NotificationCompat.PRIORITY_DEFAULT).build()
    NotificationManagerCompat.from(c).notify(if (test) TEST_ID else ALARM_ID, notification)
  }

  fun lastError(c: Context): String = prefs(c).getString("lastError", "") ?: ""
  private fun clearError(c: Context) { prefs(c).edit().remove("lastError").apply() }
  fun recordError(c: Context, stage: String, e: Exception) {
    val detail = "$stage: ${e.javaClass.simpleName}: ${e.message ?: "unknown"}".take(600)
    prefs(c).edit().putString("lastError", detail).apply()
    Log.e("MiloStudyReminder", detail, e)
  }
}
