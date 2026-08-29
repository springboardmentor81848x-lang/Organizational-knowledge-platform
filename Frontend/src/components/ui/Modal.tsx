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

  useEffect(() => {
    if (!open) return

    // Escape closes, and focus moves into the dialog so a keyboard user is not left behind
    // on the page underneath.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    // The page behind must not scroll while a dialog is over it.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

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
