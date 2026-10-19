# Svoboda keyboard: manual QA

Run on a development or release build (`npx expo run:ios`, `npx expo run:android`, or an EAS build).
Expo Go doesn't include the `svoboda-secure` native module, so the clipboard flag, background cover,
touch filtering, accessibility-sensitive flag and keyboard-learning flag are all inactive there.
Screen capture protection and the background cover are also off in `__DEV__`; test those in a
release build.

The one claim we make: **your keystrokes never pass through a keyboard app.** Nothing here tests (or
should suggest) protection against a compromised phone or OS.

## Entry points

- [ ] Tap the message box with no keyboard showing: the system keyboard opens.
- [ ] Tap **Svoboda keyboard**: the Svoboda keyboard opens, the system keyboard closes, and the button turns ink with paper text.
- [ ] With the system keyboard open, tap **Svoboda keyboard**: the system keyboard goes away first, never both on screen.
- [ ] With the Svoboda keyboard open, tap anywhere in the message text: the red caret moves there and the system keyboard does **not** appear.
- [ ] Tap **Svoboda keyboard** again while it's open: nothing changes (not a toggle).
- [ ] Chevron in the keyboard's top bar hides it. Then tapping the box opens the system keyboard.
- [ ] Type with the system keyboard, switch to the Svoboda keyboard, keep typing: same text, cursor where it was.
- [ ] Switch back (chevron, then tap the box): the text is unchanged.

## Layout

- [ ] While open: "Send" title and the Send/Receive pill are hidden; wordmark row, To picker and message box stay; the box fills the space above the keyboard.
- [ ] Text doesn't jump when switching keyboards (same font, size, line height, padding).
- [ ] Long message: the box scrolls and the caret stays in view while typing and deleting.
- [ ] Caret: 2px, red, as tall as a line. At a soft line break it sits at the start of the next line.

## Keys

- [ ] First letter of the message is capitalised; so is the first letter after ". ", "! ", "? ".
- [ ] Shift once: next letter uppercase. Double-tap: caps lock with a filled shift key. Tap again: off.
- [ ] Delete removes one character; with `é` typed as `e` + combining accent (paste one in), one delete removes both. Same for 👍🏽, 🇧🇬, 👨‍👩‍👧 pasted in.
- [ ] Holding delete repeats after a short delay and speeds up; releasing stops it immediately.
- [ ] ?123 shows digits and symbols; #+= the second page; ABC goes back. Return types a new line.
- [ ] Hold a Latin letter (a, c, e, s, z…): the accent strip appears above it; slide to choose, release to type. With shift on, accents are uppercase.
- [ ] Hold a letter with no accents (q): a normal key press on release, no strip.
- [ ] No key bubbles or magnified previews, no sound. Haptics: a light tap per key, none when system haptics / touch feedback are off.
- [ ] Encrypt with an empty message: disabled. With text: encrypts, copies, closes the keyboard, shows "Copied" and "Paste it into any messenger…", and the message box is empty.
- [ ] Paste the copied text into Receive on the other phone: it decrypts.

## Languages

- [ ] Language key shows the code (EN, БГ, …) with a small square in its top-right corner.
- [ ] Tap cycles through enabled languages in Settings order; the top bar shows `SVOBODA KEYBOARD · <LANGUAGE>`.
- [ ] Hold opens the picker 8px above the key with a pointer to it; the key stays ink while it's open. Picking a row switches and closes it; tapping outside closes it; "Manage languages" opens Settings → Languages.
- [ ] Settings → Svoboda keyboard → Languages: check and uncheck, reorder with the arrows; the last enabled language can't be unchecked.
- [ ] First launch on a phone set to Bulgarian / Russian / Ukrainian / German / French / Spanish: English and that language are enabled.
- [ ] Check each layout against a physical keyboard or the sources cited in `src/lib/keyboard/layouts/*.ts`. Bulgarian BDS and phonetic especially (see the notes there).
- [ ] Turkish: shift turns i into İ and ı into I. On a phone set to Turkish, English and other layouts still turn i into I.
- [ ] Phone set to Serbian (Cyrillic) enables Serbian Cyrillic; set to Serbian (Latin) enables Serbian Latin.
- [ ] 12-key rows (Romanian, Croatian, Serbian, Macedonian, Slovak, Turkish, Estonian) on the smallest supported phone: keys are narrow but every key is tappable.
- [ ] With many languages enabled, the language picker scrolls instead of running off the top of the screen.

## First-use tip

- [ ] Fresh install: the tip shows under the message box pointing at the Svoboda keyboard button.
- [ ] Dismissing it, or opening the Svoboda keyboard, hides it for good (survives an app restart).

## VoiceOver (iOS) and TalkBack (Android)

- [ ] Every key can be found by swiping and activated with a double tap. Labels: the letter, "Shift" / "Shift on" / "Caps lock on", "Delete", "Numbers and symbols", "Space", "Encrypt", "Language: English. Tap to switch, hold to choose".
- [ ] Accents without long-press: on a letter with accents, the actions rotor (VoiceOver) / actions menu (TalkBack) lists each variant and typing one works.
- [ ] Shift's actions include "Caps lock".
- [ ] Language key's actions include "Choose language", which opens the picker; its rows and "Manage languages" are reachable, and focus stays inside it.
- [ ] The Svoboda keyboard button announces its selected state.
- [ ] Message (Svoboda keyboard open): announced as adjustable; swipe up/down moves the cursor one character.
- [ ] Settings → Languages: each row is a checkbox with its state; move buttons and "Move up/down" actions work.

## Appearance and size

- [ ] Light and dark theme (Settings → Appearance and the phone setting): ink keys, paper text on Encrypt, red caret and status square, readable "space".
- [ ] Small phone (iPhone SE / 360dp Android) and large phone: Cyrillic layouts with 12 keys per row still fit; row 2 of English sits centred under row 1.
- [ ] System font size at maximum: message text grows; key labels grow only up to 1.3× and the grid stays intact.

## Privacy hardening (release build)

- [ ] Screen recording / mirroring (iOS): the app is covered while capture is active. Screenshot: content blank.
- [ ] Android: screenshots refused; the recents thumbnail is blank.
- [ ] App switcher (iOS): shows the white (or black in dark mode) launch screen with "Svoboda.", never a message.
- [ ] App lock: opening Svoboda asks for Face ID / fingerprint / passcode before any contact or message shows. Cancel stays on the lock screen; Unlock asks again.
- [ ] App lock: send to the background from Send, Receive (with a decrypted message) and Add someone; coming back asks again and the same screen and text are there after unlocking. Android back does nothing on the lock screen.
- [ ] App lock: Android camera permission prompt on Add someone doesn't lock the app; pulling down Control Center (iOS) doesn't either.
- [ ] iOS with a third-party keyboard installed (e.g. Gboard, SwiftKey) and selected as default: inside Svoboda only Apple's keyboard appears.
- [ ] Android: with Gboard, type in the message box with the system keyboard. The word shouldn't show up later as a suggestion elsewhere (IME_FLAG_NO_PERSONALIZED_LEARNING).
- [ ] Android: with an overlay app drawing over Svoboda (e.g. a screen-dimmer), taps on keys and the message box are ignored.
- [ ] Android 14+: an accessibility service not marked as an accessibility tool can't read the message box or keyboard.
- [ ] Android 13+: after Copy encrypted / Encrypt, the system clipboard preview hides the content.
- [ ] iOS: the copied ciphertext doesn't appear on a Mac via Universal Clipboard, and is gone from the clipboard after 5 minutes.
- [ ] Receive → Copy text: same as above for the decrypted text (hidden from the Android 13+ preview; iOS local-only, cleared after 5 minutes).
