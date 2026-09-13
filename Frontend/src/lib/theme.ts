/**
 * Which theme the app is wearing, and who decided.
 *
 * Three preferences, two outcomes. "light" and "dark" are the user's own choice and outrank
 * everything; "system" defers to the OS and keeps deferring, so a machine that dims itself in
 * the evening dims the app with it. The preference is what gets stored — storing the resolved
 * colour instead would freeze a "system" user into whichever mode they happened to sign in on.
 *
 * State lives in this module rather than in a React context so that the boot script, the
 * toggle and any future caller all read one source. Components subscribe through
 * `useTheme`, which is a `useSyncExternalStore` over the subscribe/get pair below.
 */

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/**
 * Shared with the inline boot script in index.html. That script applies the theme before the
 * first paint, so a dark-mode user never sees a white flash while the bundle loads. If this
 * key changes, that script must change with it.
 */
export const THEME_STORAGE_KEY = 'osi.theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readStored(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isPreference(stored) ? stored : 'system'
  } catch {
    // Private browsing and locked-down enterprise policies both throw here. Losing the
    // preference is survivable: the OS still gets a vote.
    return 'system'
  }
}

function writeStored(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    /* Non-fatal: the choice still holds for this tab. */
  }
}

/** What the operating system is asking for right now. */
export function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference
}

// ── Store ───────────────────────────────────────────────────────────────────

let preference: ThemePreference = readStored()
let resolved: ResolvedTheme = resolveTheme(preference)

const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

/**
 * Writes the resolved theme onto the document element, which is the only thing the stylesheet
 * reads. `color-scheme` goes with it so the browser's own furniture — scrollbars, form
 * controls, the space behind an overscroll — matches the page instead of staying stubbornly
 * white.
 */
function paint(): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.style.colorScheme = resolved
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getThemePreference(): ThemePreference {
  return preference
}

export function getResolvedTheme(): ResolvedTheme {
  return resolved
}

export function setThemePreference(next: ThemePreference): void {
  preference = next
  resolved = resolveTheme(next)
  writeStored(next)
  paint()
  emit()
}

/**
 * Flips between light and dark, resolving "system" first so the first click always moves
 * away from whatever is currently on screen rather than appearing to do nothing.
 */
export function toggleTheme(): void {
  setThemePreference(resolved === 'dark' ? 'light' : 'dark')
}

/**
 * Follows the OS while — and only while — the preference is "system". An explicit choice is
 * not overridden by the machine changing its mind.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (preference !== 'system') return
    resolved = systemTheme()
    paint()
    emit()
  })
}

// The boot script has normally painted this already; repeating it here keeps the DOM correct
// when the app is mounted somewhere that script does not run, such as a test.
paint()
