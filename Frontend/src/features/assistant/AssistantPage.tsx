import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { assistantApi } from '@/api/assistant'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useSession } from '@/features/auth/useSession'
import { ApiError } from '@/lib/apiError'
import type { AssistantMessage, AssistantSuggestedCourse } from '@/types/api'
import styles from './AssistantPage.module.css'

/**
 * The assistant.
 *
 * <h2>Why the thread lives here and not on the server</h2>
 * Each question carries the turns before it, so there is no conversation table and nothing to
 * clean up — closing the page ends the conversation, which is what somebody asking "which gap
 * should I close first?" expects. The cost is that the thread does not survive a reload, which
 * is a fair trade for a screen that reads from data the rest of the app already owns.
 *
 * Courses beneath a reply are the server's ranked catalogue rows, not names the model produced,
 * so every one of them is real and can be opened.
 */

interface Turn {
  role: 'user' | 'assistant'
  content: string
  /** Attached to assistant turns only, and only for the reply that produced them. */
  courses?: AssistantSuggestedCourse[]
  answeredByModel?: boolean
  failed?: boolean
}

const GREETING: Turn = {
  role: 'assistant',
  content:
    'Ask me about your skills, your gaps, or what to learn next. I read your own record — your ' +
    'assessments, the gaps they produced and the courses ranked against them — so the answers ' +
    'are about you rather than generic advice.',
}

export function AssistantPage() {
  const { userId } = useSession()
  const [turns, setTurns] = useState<Turn[]>([GREETING])
  const [draft, setDraft] = useState('')
  const conversationRef = useRef<HTMLDivElement>(null)

  const suggestions = useQuery({
    queryKey: queryKeys.assistant.suggestions(userId ?? undefined),
    queryFn: ({ signal }) => assistantApi.suggestions(signal),
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  })

  const ask = useMutation({
    mutationFn: ({ message, history }: { message: string; history: AssistantMessage[] }) =>
      assistantApi.chat(message, history),
    onSuccess: (response) => {
      setTurns((current) => [
        ...current,
        {
          role: 'assistant',
          content: response.answer,
          courses: response.suggestedCourses,
          answeredByModel: response.answeredByModel,
        },
      ])
    },
    onError: (error) => {
      setTurns((current) => [
        ...current,
        { role: 'assistant', content: ApiError.from(error).userMessage(), failed: true },
      ])
    },
  })

  // Keep the newest turn in view as the thread grows.
  useEffect(() => {
    const element = conversationRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [turns, ask.isPending])

  function send(message: string) {
    const trimmed = message.trim()
    if (!trimmed || ask.isPending) return

    // The greeting is ours, not part of the conversation, so it is not replayed to the server.
    const history: AssistantMessage[] = turns
      .filter((turn) => turn !== GREETING && !turn.failed)
      .map((turn) => ({ role: turn.role, content: turn.content }))

    setTurns((current) => [...current, { role: 'user', content: trimmed }])
    setDraft('')
    ask.mutate({ message: trimmed, history })
  }

  // Enter sends; Shift+Enter starts a new line, as a chat composer is expected to.
  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(draft)
    }
  }

  const lastTurn = turns[turns.length - 1]
  const prompts =
    lastTurn?.role === 'assistant' && !ask.isPending ? (suggestions.data ?? []) : []

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Assistant</h1>
        <p className={styles.subtitle}>
          Answers drawn from your own skills, gaps and training. It explains and recommends; it
          does not change your record, so enrolling and assessing stay where they were.
        </p>
      </header>

      <Card>
        <div className={styles.conversation} ref={conversationRef} aria-live="polite">
          {turns.map((turn, index) => (
            <TurnBubble key={index} turn={turn} />
          ))}

          {ask.isPending && (
            <div className={`${styles.turn} ${styles.turnAssistant}`}>
              <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                <span className={styles.thinking} aria-label="Thinking">
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </span>
              </div>
            </div>
          )}
        </div>

        {prompts.length > 0 && (
          <div className={styles.prompts}>
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className={styles.prompt}
                onClick={() => send(prompt)}
                disabled={ask.isPending}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className={styles.composer}>
          <textarea
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your gaps, what to learn next, or how you are progressing"
            rows={1}
            maxLength={2000}
            disabled={ask.isPending}
            aria-label="Your question"
          />
          <Button
            variant="primary"
            onClick={() => send(draft)}
            loading={ask.isPending}
            disabled={!draft.trim()}
          >
            Send
          </Button>
        </div>
        <p className={styles.composerHint}>Enter sends, Shift + Enter starts a new line.</p>
      </Card>
    </div>
  )
}

function TurnBubble({ turn }: { turn: Turn }) {
  const isUser = turn.role === 'user'
  const bubbleClasses = [
    styles.bubble,
    isUser ? styles.bubbleUser : styles.bubbleAssistant,
    turn.failed ? styles.bubbleError : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`${styles.turn} ${isUser ? styles.turnUser : styles.turnAssistant}`}>
      <div className={bubbleClasses}>
        {turn.content}

        {turn.courses && turn.courses.length > 0 && (
          <div className={styles.courses}>
            <span className={styles.coursesLabel}>Ranked for you</span>
            {turn.courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>
        )}

        {turn.answeredByModel === false && (
          <span className={styles.offlineTag}>
            Written from your data without a language model — set an API key to enable generated
            replies.
          </span>
        )}
      </div>
    </div>
  )
}

function CourseRow({ course }: { course: AssistantSuggestedCourse }) {
  const meta = [course.provider, course.difficulty, course.durationLabel]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={styles.course}>
      <div className={styles.courseBody}>
        <div className={styles.courseTitle}>
          {course.externalUrl ? (
            <a
              className={styles.courseLink}
              href={course.externalUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              {course.title}
            </a>
          ) : (
            course.title
          )}
        </div>
        <div className={styles.courseMeta}>
          {meta}
          {meta && ' · '}
          for {course.skillName}
        </div>
      </div>
      <span className={styles.courseScore}>{course.relevanceScore} / 100</span>
    </div>
  )
}
