import { useTheme } from '@/hooks/useTheme'
import styles from './ThemeToggle.module.css'

/**
 * Switches between the light and dark themes.
 *
 * The glyph shows the theme being offered, not the one in force, and the label says so out
 * loud — an icon button whose picture could mean either the current state or the next one is
 * a coin toss for the reader.
 *
 * There is no "system" position. The preference defaults to system and stays there until
 * somebody presses this, which is the point at which they have plainly expressed a view; a
 * three-way cycle through an unlabelled icon asks a reader to keep count instead.
 */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const goingDark = resolved === 'light'
  const label = goingDark ? 'Switch to dark theme' : 'Switch to light theme'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <span className={styles.glyph} aria-hidden="true">
        {goingDark ? '☾' : '☀'}
      </span>
    </button>
  )
}
