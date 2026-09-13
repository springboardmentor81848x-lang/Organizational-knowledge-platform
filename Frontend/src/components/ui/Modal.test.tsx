import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

/**
 * Typing in a dialog.
 *
 * <h2>The bug this pins</h2>
 * Every caller passes an inline close handler — `onClose={() => setOpen(false)}` — which is a
 * new function on each render, and a dialog holding its own state re-renders as the user types.
 * The dialog's focus effect used to list `onClose` in its dependencies, so each keystroke tore
 * the effect down and set it up again, and its cleanup restores focus to whatever opened the
 * dialog. The result was a field that took one character before focus jumped back to the trigger
 * button, so an email address had to be typed a letter at a time, clicking into the box between
 * each one.
 *
 * <h2>Why the assertion is a focus count rather than the field's value</h2>
 * The obvious test — type a string, check the field holds it — passes either way once the
 * dialog also focuses its first field on setup, because the teardown and the immediate re-setup
 * cancel out by the time the assertion runs. What is left is the churn itself: focus really does
 * leave for the trigger and come back, on every keystroke. Counting the trigger's focus events
 * is what makes that visible, and it fails on the original code.
 */
describe('Modal', () => {
  // The suite runs with globals disabled, so React Testing Library's automatic cleanup is not
  // registered and has to be called by hand. Without it the second test finds two dialogs.
  afterEach(cleanup)

  /**
   * A trigger button and a dialog with a field, whose state lives in the dialog's parent — the
   * shape every caller in the app has, and the shape the bug needs.
   */
  function ForgotPasswordScreen({ onTriggerFocus }: { onTriggerFocus?: () => void }) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')

    return (
      <>
        <button type="button" onClick={() => setOpen(true)} onFocus={onTriggerFocus}>
          Forgot password?
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Reset your password">
          <label htmlFor="email">Work email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Modal>
      </>
    )
  }

  it('does not bounce focus back to the trigger on every keystroke', async () => {
    const user = userEvent.setup()
    let triggerFocusCount = 0

    render(<ForgotPasswordScreen onTriggerFocus={() => (triggerFocusCount += 1)} />)

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
    const field = screen.getByLabelText('Work email') as HTMLInputElement

    // Only what was typed after the dialog opened counts; opening it involved a real click on
    // the trigger, which legitimately focuses it.
    triggerFocusCount = 0
    await user.keyboard('someone@example.com')

    expect(triggerFocusCount).toBe(0)
    expect(field.value).toBe('someone@example.com')
    expect(document.activeElement).toBe(field)
  })

  it('puts focus in the first field when it opens, not on the dialog container', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordScreen />)

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))

    // Focusing the container would leave every dialog with a form one tab away from the thing
    // the user opened it to type into.
    expect(document.activeElement).toBe(screen.getByLabelText('Work email'))
  })
})
