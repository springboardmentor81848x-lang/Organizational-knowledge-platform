import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ApiError } from '@/lib/apiError'
import styles from './LoginPage.module.css'

/**
 * Reporting that you cannot get in.
 *
 * The request reaches the administrators who hold the reset. It deliberately does not promise
 * an email, because none is sent: saying "check your inbox" would send somebody to wait for a
 * message that will never arrive.
 *
 * The confirmation is the same whether or not the address has an account, matching the server,
 * which answers identically so the screen cannot be used to discover who works here.
 */
export function ForgotPasswordDialog({
  open,
  onClose,
  initialEmail,
}: {
  open: boolean
  onClose: () => void
  initialEmail?: string
}) {
  const [email, setEmail] = useState(initialEmail ?? '')

  const request = useMutation({
    mutationFn: (address: string) => authApi.forgotPassword(address),
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    request.mutate(email.trim())
  }

  function handleClose() {
    request.reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Reset your password"
      description={
        request.isSuccess
          ? undefined
          : 'We will pass this to the administrators who can reset it for you.'
      }
      size="sm"
      footer={
        request.isSuccess ? (
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              form="forgot-password-form"
              loading={request.isPending}
              disabled={!email.trim()}
            >
              Send request
            </Button>
          </>
        )
      }
    >
      {request.isSuccess ? (
        <p className={styles.dialogBody}>
          If <strong>{email.trim()}</strong> has an account, an administrator has been notified and
          will be in touch to reset it. You will not receive an email from the platform itself.
        </p>
      ) : (
        <form id="forgot-password-form" onSubmit={handleSubmit} noValidate>
          {request.isError && (
            <div className={styles.error} role="alert">
              <span aria-hidden="true">!</span>
              <span>{ApiError.from(request.error).userMessage()}</span>
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="forgot-email">
              Work email
            </label>
            <input
              id="forgot-email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </form>
      )}
    </Modal>
  )
}
