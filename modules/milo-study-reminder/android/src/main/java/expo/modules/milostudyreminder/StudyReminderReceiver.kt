package expo.modules.milostudyreminder

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class StudyReminderReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val pending = goAsync()
    Thread {
      try {
        StudyReminderScheduler.receive(context.applicationContext, intent)
      } catch (error: Exception) {
        StudyReminderScheduler.recordError(context, "receiver:${intent.action}", error)
      } finally {
        pending.finish()
      }
    }.start()
  }
}
