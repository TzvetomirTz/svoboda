package expo.modules.svobodasecure

import android.content.Context
import android.os.Build
import android.view.View
import android.view.ViewTreeObserver
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

// Wraps the message box and the Svoboda keyboard.
// - Android 14+: marks the subtree accessibility-data-sensitive, so only accessibility services
//   that declare themselves tools for people with disabilities can read it.
// - Drops touches while another window covers ours (also set app-wide by the module).
// - Asks the system keyboard not to learn from text typed into any EditText inside
//   (IME_FLAG_NO_PERSONALIZED_LEARNING). React Native doesn't expose the flag and resets imeOptions
//   when returnKeyType changes, so it is added again whenever an EditText inside gains focus,
//   which happens before the keyboard reads the EditorInfo.
class SecureInputView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val focusListener = ViewTreeObserver.OnGlobalFocusChangeListener { _, newFocus ->
    if (newFocus is EditText && isAncestorOf(newFocus)) protect(newFocus)
  }

  init {
    filterTouchesWhenObscured = true
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      setAccessibilityDataSensitive(View.ACCESSIBILITY_DATA_SENSITIVE_YES)
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    viewTreeObserver.addOnGlobalFocusChangeListener(focusListener)
  }

  override fun onDetachedFromWindow() {
    viewTreeObserver.removeOnGlobalFocusChangeListener(focusListener)
    super.onDetachedFromWindow()
  }

  private fun isAncestorOf(view: View): Boolean {
    var parent = view.parent
    while (parent != null) {
      if (parent === this) return true
      parent = parent.parent
    }
    return false
  }

  private fun protect(editText: EditText) {
    val flag = EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING
    if (editText.imeOptions and flag != 0) return
    editText.imeOptions = editText.imeOptions or flag
    // If the keyboard already connected, make it read the new options.
    val imm = context.getSystemService(InputMethodManager::class.java)
    if (imm?.isActive(editText) == true) imm.restartInput(editText)
  }
}
