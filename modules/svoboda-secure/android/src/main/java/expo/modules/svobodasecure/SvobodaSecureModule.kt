package expo.modules.svobodasecure

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Android side of Svoboda's privacy hardening. None of this protects against a compromised phone:
// the OS still draws the screen and delivers every touch.
class SvobodaSecureModule : Module() {
  private var filterTouches = false

  private fun applyTouchFilter() {
    appContext.currentActivity?.window?.decorView?.filterTouchesWhenObscured = true
  }

  override fun definition() = ModuleDefinition {
    Name("SvobodaSecure")

    // Copies text and marks the clip as sensitive, so the system clipboard preview (Android 13+) and
    // keyboards that honour the flag hide it. The expiry is iOS only; Android has no clip expiry.
    AsyncFunction("setSensitiveString") { text: String, _: Double ->
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      val clip = ClipData.newPlainText(null, text)
      clip.description.extras = PersistableBundle().apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true)
        } else {
          // The same key before it was public API; Gboard reads it on older versions too.
          putBoolean("android.content.extra.IS_SENSITIVE", true)
        }
      }
      clipboard.setPrimaryClip(clip)
    }.runOnQueue(Queues.MAIN)

    // React Native dispatches touches to JS from the root view, so the flag has to sit at the top
    // of the window to reach every Pressable: touches that arrive while another app's window covers
    // ours (a tapjacking overlay) are dropped for the whole app.
    AsyncFunction("filterObscuredTouches") {
      filterTouches = true
      applyTouchFilter()
    }.runOnQueue(Queues.MAIN)

    // A recreated activity has a new window; filter its touches too.
    OnActivityEntersForeground {
      if (filterTouches) applyTouchFilter()
    }

    // iOS only. Android backups are switched off in the manifest (plugins/with-no-android-backup.js).
    Function("excludeFromBackup") { _: String -> }

    // iOS only. On Android, FLAG_SECURE (from expo-screen-capture) already blanks the recents thumbnail.
    AsyncFunction("enableBackgroundCover") {}

    View(SecureInputView::class) {}
  }
}
