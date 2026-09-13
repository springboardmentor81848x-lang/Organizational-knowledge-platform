import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '@/api/quiz'
import { queryKeys } from '@/api/queryKeys'
import { invalidateAfterAssessment } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { AssessmentAttemptStatus, QuizQuestion, QuizResult } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import { AttemptLockedCard } from './ReattemptRequest'
import styles from './TargetRoleQuiz.module.css'

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

/**
 * The real assessment: multiple-choice questions drawn from the skills the employee's target
 * role is measured on.
 *
 * <p>Nothing here decides a score. The paper arrives without an answer key and the submission is
 * marked on the server, which then records it as an assessment on the employee - so the levels, gaps,
 * heatmap and recommendations that follow are the server's, not this component's. That is also
 * why the result view renders what came back rather than anything computed locally.
 *
 * <p>The assessment is sat once. Where the employee stands is asked for before a paper is, so
 * somebody who has used their attempt is shown the request form rather than a paper the server
 * would decline to mark - the same rule is enforced when the paper is issued and again when
 * answers arrive, and this query only decides what the screen offers.
 */
export function TargetRoleQuiz() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)

  const attempt = useQuery({
    queryKey: queryKeys.assessments.attemptStatus(),
    queryFn: ({ signal }) => quizApi.attemptStatus(signal),
    retry: false,
  })

  const quiz = useQuery({
    queryKey: ['target-role-quiz'],
    queryFn: ({ signal }) => quizApi.getQuiz(signal),
    // Not asked for until the attempt is known to be allowed. Fetching first and handling the
    // refusal afterwards would put the questions in the browser of somebody who may not sit
    // them, which is exactly what the once-only rule exists to prevent.
    enabled: attempt.data?.canTake === true,
    // The paper should not be silently swapped underneath a half-finished attempt.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const submit = useMutation({
    mutationFn: () =>
      quizApi.submit(
        Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId: Number(questionId),
          selectedOption,
        })),
      ),
    onSuccess: async (data) => {
      setResult(data)
      toast.success(
        'Assessment submitted',
        `${data.totalCorrect} of ${data.totalQuestions} correct. Your skills and gaps have been updated.`,
      )
      // Submitting moves skill levels, which moves gaps, the heatmap, recommendations and the
      // learning path. Everything downstream is refetched rather than patched locally - and that
      // includes the attempt status, which has just changed: the attempt is spent, and so is the
      // approval that may have unlocked it.
      if (user) {
        await invalidateAfterAssessment(queryClient, user.id)
      }
    },
  })

  const questions = quiz.data?.questions ?? []
  const answeredCount = Object.keys(answers).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  /** Questions grouped by skill, so the paper reads as sections rather than a flat list. */
  const bySkill = useMemo(() => {
    const groups = new Map<string, QuizQuestion[]>()
    for (const question of questions) {
      const existing = groups.get(question.skillName)
      if (existing) existing.push(question)
      else groups.set(question.skillName, [question])
    }
    return [...groups.entries()]
  }, [questions])

  if (result) {
    return (
      <QuizResultView
        result={result}
        // Whether a retake is offered comes from the refreshed status, which after a normal
        // first submission says no. A button the server would refuse is worse than no button,
        // so what replaces it is the request form.
        attempt={attempt.data ?? null}
        onRetake={() => {
          setResult(null)
          setAnswers({})
          quiz.refetch()
        }}
      />
    )
  }

  if (attempt.isLoading) return <LoadingBlock label="Checking your assessment" />

  if (attempt.isError) {
    return (
      <Card>
        <ErrorBlock
          error={attempt.error}
          title="Your assessment could not be opened"
          onRetry={attempt.refetch}
        />
      </Card>
    )
  }

  // An operational account is told plainly that it is not measured, rather than being shown a
  // locked assessment as though it had spent an attempt it never had.
  if (attempt.data && !attempt.data.developmentTrack) {
    return (
      <Card>
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>This account is not assessed</h3>
          <p className={styles.emptyText}>{attempt.data.message}</p>
        </div>
      </Card>
    )
  }

  if (attempt.data && !attempt.data.canTake) {
    return <AttemptLockedCard status={attempt.data} />
  }

  if (quiz.isPending) return <LoadingBlock label="Building your assessment" />

  if (quiz.isError) {
    const error = ApiError.from(quiz.error)
    // A missing target role or an unauthored question bank are both expected states with a
    // specific remedy, so they get the server's own explanation rather than a generic failure.
    return (
      <Card>
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>This assessment is not ready yet</h3>
          <p className={styles.emptyText}>{error.userMessage()}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={styles.quiz}>
      <Card>
        <div className={styles.quizHeader}>
          <div>
            <h2 className={styles.quizTitle}>
              Assessment for {quiz.data?.targetJobTitle}
            </h2>
            <p className={styles.quizSub}>
              {quiz.data?.questionCount} questions across the {quiz.data?.skillCount} skills this
              role is measured on. Your answers set your proficiency and, through it, your gaps.
            </p>
          </div>
          <div className={styles.progress}>
            <span className={styles.progressCount}>
              {answeredCount}/{questions.length}
            </span>
            <span className={styles.progressLabel}>answered</span>
          </div>
        </div>

        {/*
          Said before the first question rather than after the last. Which paper this is, and
          whether it costs the one attempt, changes how somebody sits it - and telling them once
          they have finished is telling them too late.
        */}
        <p className={styles.attemptNotice}>
          {attempt.data?.scope === 'NEW_SKILLS'
            ? 'This paper covers only the skills you added that have never been assessed. It does not affect the levels you have already been measured at, and it does not use up an approved retake.'
            : attempt.data?.activeApproval
              ? (attempt.data.activeApproval.decidedByName ?? 'Your approver') +
                ' approved this attempt. Submitting uses it up, and a further attempt would need a new approval.'
              : 'This assessment is taken once. Once you submit, taking it again needs approval from your manager or HR.'}
        </p>

        <div className={styles.progressBar} role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={questions.length}>
          <div
            className={styles.progressFill}
            style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {submit.isError && (
        <Card>
          <ErrorBlock error={submit.error} title="Your answers could not be submitted" />
        </Card>
      )}

      {bySkill.map(([skillName, skillQuestions]) => (
        <Card key={skillName}>
          <h3 className={styles.skillHeading}>{skillName}</h3>
          <ol className={styles.questionList}>
            {skillQuestions.map((question) => (
              <li key={question.questionId} className={styles.question}>
                <div className={styles.questionHead}>
                  <p className={styles.questionText}>{question.questionText}</p>
                  <span className={styles.difficulty} title="The level this question demonstrates">
                    {question.difficulty}
                  </span>
                </div>

                <div className={styles.options}>
                  {question.options.map((option, index) => {
                    const letter = OPTION_LETTERS[index]
                    const inputId = `q${question.questionId}-${letter}`
                    const checked = answers[question.questionId] === letter
                    return (
                      <label
                        key={letter}
                        htmlFor={inputId}
                        className={[styles.option, checked ? styles.optionChecked : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={`q${question.questionId}`}
                          value={letter}
                          checked={checked}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [question.questionId]: letter }))
                          }
                          className={styles.optionInput}
                        />
                        <span className={styles.optionLetter}>{letter}</span>
                        <span className={styles.optionText}>{option}</span>
                      </label>
                    )
                  })}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ))}

      <Card>
        <div className={styles.submitRow}>
          <p className={styles.submitHint}>
            {allAnswered
              ? 'All questions answered. Submitting records the result and recalculates your gaps, and uses up your attempt.'
              : `${questions.length - answeredCount} question${
                  questions.length - answeredCount === 1 ? '' : 's'
                } still to answer.`}
          </p>
          <Button
            variant="primary"
            size="lg"
            loading={submit.isPending}
            disabled={!allAnswered || submit.isPending}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? 'Marking' : 'Submit assessment'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ── Result ───────────────────────────────────────────────────────────────────

function QuizResultView({
  result,
  attempt,
  onRetake,
}: {
  result: QuizResult
  attempt: AssessmentAttemptStatus | null
  onRetake: () => void
}) {
  const [showReview, setShowReview] = useState(false)
  const canRetakeNow = attempt?.canTake === true

  return (
    <div className={styles.quiz}>
      <Card>
        <div className={styles.resultHeader}>
          <div>
            <h2 className={styles.quizTitle}>
              {result.totalCorrect} of {result.totalQuestions} correct
            </h2>
            <p className={styles.quizSub}>
              Assessed against {result.targetJobTitle} · {result.targetDepartment}. Your skill
              levels and gaps have been updated from this result.
            </p>
          </div>
          <div className={styles.scoreRing} aria-label={`${result.overallScorePercentage}% overall`}>
            <span className={styles.scoreValue}>{Math.round(result.overallScorePercentage)}%</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className={styles.skillHeading}>What each skill scored</h3>
        <table className={styles.scoreTable}>
          <thead>
            <tr>
              <th scope="col">Skill</th>
              <th scope="col">Correct</th>
              <th scope="col">Score</th>
              <th scope="col">Level awarded</th>
              <th scope="col">Change</th>
            </tr>
          </thead>
          <tbody>
            {result.skillScores.map((score) => (
              <tr key={score.skillId}>
                <th scope="row">{score.skillName}</th>
                <td>
                  {score.questionsCorrect}/{score.questionsAsked}
                </td>
                <td>{score.scorePercentage}%</td>
                <td>
                  <span className={styles.levelPill}>{score.awardedProficiency}</span>
                </td>
                <td>
                  {score.previousProficiency == null ? (
                    <span className={styles.changeNeutral}>First assessment</span>
                  ) : score.improvement > 0 ? (
                    <span className={styles.changeUp}>▲ {score.improvement} from {score.previousProficiency}</span>
                  ) : score.improvement < 0 ? (
                    <span className={styles.changeDown}>▼ {Math.abs(score.improvement)} from {score.previousProficiency}</span>
                  ) : (
                    <span className={styles.changeNeutral}>No change</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className={styles.submitRow}>
          <p className={styles.submitHint}>
            {canRetakeNow
              ? 'You still have an approved attempt available.'
              : 'That was your attempt. Taking the assessment again needs approval.'}
          </p>
          <div className={styles.resultActions}>
            <Button variant="secondary" onClick={() => setShowReview((v) => !v)}>
              {showReview ? 'Hide answers' : 'Review answers'}
            </Button>
            {canRetakeNow && (
              <Button variant="primary" onClick={onRetake}>
                Take it again
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/*
        The request form sits directly under the result rather than behind a reload. Somebody who
        has just seen a score they are unhappy with is exactly who needs it, and making them find
        their way back to a locked screen to ask would be a step for no reason.
      */}
      {attempt && !attempt.canTake && <AttemptLockedCard status={attempt} />}

      {showReview &&
        result.gradedAnswers.map((answer) => (
          <Card key={answer.questionId}>
            <div className={styles.reviewItem}>
              <div className={styles.questionHead}>
                <p className={styles.questionText}>{answer.questionText}</p>
                <span className={answer.correct ? styles.markCorrect : styles.markWrong}>
                  {answer.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className={styles.reviewLine}>
                <span className={styles.reviewLabel}>{answer.skillName}</span>
                {' · you answered '}
                <strong>{answer.selectedOption}</strong>
                {!answer.correct && (
                  <>
                    {', the answer is '}
                    <strong>{answer.correctOption}</strong>
                  </>
                )}
              </p>
              {answer.explanation && <p className={styles.explanation}>{answer.explanation}</p>}
            </div>
          </Card>
        ))}
    </div>
  )
}
