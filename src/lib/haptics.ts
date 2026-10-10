/** A 10 ms tap on key actions where the Vibration API exists (Android Chrome). Silent everywhere else. */
export function haptic() {
  try {
    if (!document.documentElement.hasAttribute('data-reduce-motion')) navigator.vibrate?.(10)
  } catch {
    // unsupported
  }
}
