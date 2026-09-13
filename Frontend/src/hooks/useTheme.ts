import { useSyncExternalStore } from 'react'
import {
  getResolvedTheme,
  getThemePreference,
  setThemePreference,
  subscribeTheme,
  toggleTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme'

export interface UseThemeResult {
  /** What the user asked for, including "system". */
  preference: ThemePreference
  /** What that actually resolves to right now. */
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  toggle: () => void
}

/**
 * Subscribes to the theme store.
 *
 * Both snapshots are plain strings, so `useSyncExternalStore` can compare them by identity and
 * will not re-render on every emit. Every caller reads the same module state, so two controls
 * mounted at once cannot disagree about which theme is on.
 */
export function useTheme(): UseThemeResult {
  const preference = useSyncExternalStore(subscribeTheme, getThemePreference, getThemePreference)
  const resolved = useSyncExternalStore(subscribeTheme, getResolvedTheme, getResolvedTheme)

  return { preference, resolved, setPreference: setThemePreference, toggle: toggleTheme }
}
