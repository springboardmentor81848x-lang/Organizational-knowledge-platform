import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  /** Buttons, usually a cancel and a confirm. */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Modal({ open, onClose, title, description, footer, size = 'md', children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  /**
   * The close handler, held in a ref so the effect below does not depend on its identity.
   *
   * Callers pass an inline arrow — `onClose={() => setOpen(false)}` — which is a new function on
   * every render of the caller, and a dialog holding its own state re-renders its parent chain
   * as the user types. If the effect depended on `onClose` it would therefore tear down and set
   * up again on every keystroke, and its cleanup restores focus to whatever opened the dialog.
   * The visible symptom is a field that accepts exactly one character before focus jumps away,
   * which is what this ref exists to prevent.
   */
  const onCloseRef = useRef(onClose)
  // Assigned in an effect rather than during render: a ref written while rendering is not safe
  // under concurrent rendering, and nothing reads this one until a keydown fires long after.
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    // Escape closes, and focus moves into the dialog so a keyboard user is not left behind
    // on the page underneath.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)

    const previouslyFocused = document.activeElement as HTMLElement | null

    // Focus the first field if the dialog has one, and the dialog itself otherwise. Focusing
    // the container unconditionally would make every dialog with a form start one tab away
    // from the thing the user opened it to type into.
    const firstField = dialogRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])',
    )
    ;(firstField ?? dialogRef.current)?.focus()

    // The page behind must not scroll while a dialog is over it.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
    // Deliberately keyed on `open` alone: see onCloseRef above.
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={styles.backdrop}
      // Only a click that starts and ends on the backdrop closes; dragging a selection out of
      // the dialog should not dismiss the work in it.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={[styles.dialog, styles[size]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close" type="button">
            ×
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
