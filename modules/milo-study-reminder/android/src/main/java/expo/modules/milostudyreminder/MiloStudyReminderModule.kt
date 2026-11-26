package expo.modules.milostudyreminder

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MiloStudyReminderModule : Module() {
  private fun <T> run(stage: String, action: (Context) -> T): T {
    val context = appContext.reactContext ?: throw IllegalStateException("React context is unavailable")
    return try { action(context) } catch (error: Exception) {
      StudyReminderScheduler.recordError(context, stage, error)
      throw error
    }
  }

  override fun definition() = ModuleDefinition {
    Name("MiloStudyReminder")
    AsyncFunction("getSettings") { run("load") { StudyReminderScheduler.settings(it) } }
    AsyncFunction("configure") { json: String -> run("configure") { StudyReminderScheduler.configure(it, json) } }
    AsyncFunction("reconcile") { run("reconcile") { StudyReminderScheduler.reconcile(it) } }
    AsyncFunction("markStudied") { day: String -> run("study") { StudyReminderScheduler.markStudied(it, day) } }
    AsyncFunction("test") { run("test") { StudyReminderScheduler.test(it) } }
    AsyncFunction("getLastError") { run("diagnostics") { StudyReminderScheduler.lastError(it) } }
  }
}
