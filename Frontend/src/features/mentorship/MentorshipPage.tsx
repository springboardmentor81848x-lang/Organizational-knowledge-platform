import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mentorshipApi } from '@/api/mentorship'
import { skillsApi } from '@/api/skills'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { ProficiencyScale } from '@/components/ui/ProficiencyScale'
import { StatusPill } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { Mentorship, RecommendedMentor } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import styles from './MentorshipPage.module.css'

/**
 * Mentorship, from both ends.
 *
 * The same list carries the mentorships somebody is in as mentee and as mentor, because the
 * backend returns both from one call — so the requests waiting on you appear beside the ones
 * you are waiting on, rather than being a separate screen you have to remember to check.
 */
export function MentorshipPage() {
  const { user } = useSession()
  if (!user) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mentorship</h1>
        <p className={styles.subtitle}>
          Find somebody further along in a skill you are working on, and see where your existing
          arrangements stand.
        </p>
      </header>

      <IncomingRequests employeeId={user.id} />
      <MyMentorships employeeId={user.id} />
      <FindAMentor employeeId={user.id} />
    </div>
  )
}

/** Shared fetch: the backend returns mentorships on both sides of the relationship. */
function useMentorships(employeeId: number) {
  return useQuery({
    queryKey: queryKeys.mentorships.forUser(employeeId),
    queryFn: ({ signal }) => mentorshipApi.forEmployee(employeeId, signal),
  })
}

/**
 * Invalidation after accepting or rejecting.
 *
 * Both people's screens are driven by their own key, so the mentor's list and the mentee's list
 * are different cache entries. Dropping the whole mentorship branch refreshes both, which is
 * what makes the mentee see the acceptance without reloading.
 */
function useRespond() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      accept ? mentorshipApi.accept(id) : mentorshipApi.reject(id),
    onSuccess: async (mentorship, { accept }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.mentorships.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
      ])
      toast.success(
        accept ? 'Mentorship accepted' : 'Request declined',
        accept ? `You are now mentoring ${mentorship.menteeName} in ${mentorship.skillName}.` : undefined,
      )
    },
    onError: (error) => toast.fromError('Could not respond to the request', error),
  })
}

// ── Requests waiting on you ─────────────────────────────────────────────────

function IncomingRequests({ employeeId }: { employeeId: number }) {
  const query = useMentorships(employeeId)
  const respond = useRespond()

  const incoming = (query.data ?? []).filter(
    (m) => m.mentorId === employeeId && m.status === 'REQUESTED',
  )

  if (query.isLoading || query.isError || incoming.length === 0) return null

  return (
    <Card
      title="Requests waiting on you"
      description="People who have asked you to mentor them."
      className={styles.incoming}
    >
      <ul className={styles.list}>
        {incoming.map((mentorship) => (
          <li className={styles.requestRow} key={mentorship.mentorshipId}>
            <div className={styles.requestBody}>
              <span className={styles.name}>{mentorship.menteeName}</span>
              <span className={styles.meta}>
                wants help with <strong>{mentorship.skillName}</strong>
              </span>
              {mentorship.goal && <p className={styles.goal}>“{mentorship.goal}”</p>}
            </div>
            <div className={styles.requestActions}>
              <Button
                size="sm"
                loading={respond.isPending && respond.variables?.id === mentorship.mentorshipId}
                onClick={() => respond.mutate({ id: mentorship.mentorshipId, accept: false })}
              >
                Decline
              </Button>
              <Button
                size="sm"
                variant="primary"
                loading={respond.isPending && respond.variables?.id === mentorship.mentorshipId}
                onClick={() => respond.mutate({ id: mentorship.mentorshipId, accept: true })}
              >
                Accept
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// ── Everything you are part of ──────────────────────────────────────────────

function MyMentorships({ employeeId }: { employeeId: number }) {
  const query = useMentorships(employeeId)

  if (query.isLoading) {
    return (
      <Card title="Your mentorships" flush>
        <LoadingBlock rows={3} label="Loading mentorships" />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card title="Your mentorships" flush>
        {isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )}
      </Card>
    )
  }
  if (!query.data || query.data.length === 0) {
    return (
      <Card title="Your mentorships" flush>
        <EmptyBlock
          title="No mentorships yet"
          message="Request a mentor below for a skill you are working on."
        />
      </Card>
    )
  }

  return (
    <Card title="Your mentorships" description="Every arrangement you are part of, on either side.">
      <ul className={styles.list}>
        {query.data.map((mentorship) => (
          <MentorshipRow key={mentorship.mentorshipId} mentorship={mentorship} employeeId={employeeId} />
        ))}
      </ul>
    </Card>
  )
}

function MentorshipRow({
  mentorship,
  employeeId,
}: {
  mentorship: Mentorship
  employeeId: number
}) {
  const asMentee = mentorship.menteeId === employeeId
  const other = asMentee ? mentorship.mentorName : mentorship.menteeName

  return (
    <li className={styles.mentorshipRow}>
      <span className={styles.avatar} aria-hidden="true">
        {initials(other)}
      </span>
      <div className={styles.mentorshipBody}>
        <div className={styles.mentorshipHead}>
          <span className={styles.name}>{other}</span>
          <StatusPill value={mentorship.status} />
        </div>
        <span className={styles.meta}>
          {asMentee ? 'Mentoring you in' : 'You are mentoring them in'}{' '}
          <strong>{mentorship.skillName}</strong>
          {mentorship.startDate ? ` · since ${formatDate(mentorship.startDate)}` : ''}
          {mentorship.endDate ? ` · until ${formatDate(mentorship.endDate)}` : ''}
        </span>
        {mentorship.goal && <p className={styles.goal}>“{mentorship.goal}”</p>}
      </div>
    </li>
  )
}

// ── Finding one ─────────────────────────────────────────────────────────────

function FindAMentor({ employeeId }: { employeeId: number }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [skillId, setSkillId] = useState<number | ''>('')
  const [goal, setGoal] = useState('')

  const skills = useQuery({
    queryKey: queryKeys.skills.catalog(),
    queryFn: ({ signal }) => skillsApi.list(signal),
  })

  const suggestions = useQuery({
    queryKey: queryKeys.mentorships.recommendations(employeeId, Number(skillId)),
    queryFn: ({ signal }) => mentorshipApi.recommendations(employeeId, Number(skillId), signal),
    enabled: skillId !== '',
  })

  const request = useMutation({
    mutationFn: (mentorId: number) =>
      mentorshipApi.request({
        menteeId: employeeId,
        mentorId,
        skillId: Number(skillId),
        goal: goal.trim() || undefined,
      }),
    onSuccess: async (mentorship) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.mentorships.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
      ])
      setGoal('')
      toast.success('Request sent', `${mentorship.mentorName} has been asked to mentor you.`)
    },
    onError: (error) => toast.fromError('Could not send the request', error),
  })

  return (
    <Card
      title="Find a mentor"
      description="Ranked by how far ahead they are, whether they are in your department, and how many people they already mentor."
    >
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="skill">
            Skill you want help with
          </label>
          <select
            id="skill"
            className={styles.select}
            value={skillId}
            onChange={(event) => setSkillId(Number(event.target.value))}
            disabled={skills.isLoading}
          >
            <option value="">Choose a skill…</option>
            {(skills.data ?? []).map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="goal">
            What you want to get out of it (optional)
          </label>
          <input
            id="goal"
            className={styles.input}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="e.g. Reach production competence with Spring Security"
          />
        </div>
      </div>

      {skillId === '' ? (
        <p className={styles.note}>Choose a skill to see who could help.</p>
      ) : suggestions.isLoading ? (
        <LoadingBlock rows={3} label="Finding mentors" />
      ) : suggestions.isError ? (
        <ErrorBlock error={suggestions.error} onRetry={suggestions.refetch} />
      ) : !suggestions.data || suggestions.data.length === 0 ? (
        <p className={styles.note}>
          Nobody on record holds this skill above your own level, so there is no one to suggest.
        </p>
      ) : (
        <ul className={styles.list}>
          {suggestions.data.map((mentor) => (
            <MentorSuggestion
              key={mentor.mentorId}
              mentor={mentor}
              onRequest={() => request.mutate(mentor.mentorId)}
              requesting={request.isPending && request.variables === mentor.mentorId}
              error={request.error}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

/**
 * One candidate, with the reasons the server gave for the match.
 *
 * The reasons are the useful part. A score alone asks the reader to trust a ranking; "two levels
 * above you, same department, mentoring nobody else" lets them judge it.
 */
function MentorSuggestion({
  mentor,
  onRequest,
  requesting,
  error,
}: {
  mentor: RecommendedMentor
  onRequest: () => void
  requesting: boolean
  error: unknown
}) {
  return (
    <li className={styles.suggestion}>
      <span className={styles.avatar} aria-hidden="true">
        {initials(mentor.mentorName)}
      </span>
      <div className={styles.suggestionBody}>
        <div className={styles.suggestionHead}>
          <span className={styles.name}>{mentor.mentorName}</span>
          <span className={styles.score}>Match {Math.round(mentor.matchScore)}/100</span>
        </div>
        <span className={styles.meta}>
          {mentor.jobTitle ?? 'Colleague'}
          {mentor.department ? ` · ${mentor.department}` : ''}
        </span>

        <div className={styles.levels}>
          <span className={styles.levelLabel}>Holds {mentor.skillName} at</span>
          <ProficiencyScale level={mentor.mentorProficiency} compact />
        </div>

        {mentor.reasons.length > 0 && (
          <ul className={styles.reasons}>
            {mentor.reasons.map((reason) => (
              <li key={reason} className={styles.reason}>
                {reason}
              </li>
            ))}
          </ul>
        )}

        {!mentor.available && (
          <p className={styles.unavailable}>
            Currently mentoring {mentor.activeMentorships} people and may not have capacity.
          </p>
        )}

        {requesting && error !== null && error !== undefined ? (
          <p className={styles.errorText}>{ApiError.from(error).userMessage()}</p>
        ) : null}
      </div>
      <Button size="sm" variant="primary" loading={requesting} onClick={onRequest}>
        Request
      </Button>
    </li>
  )
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
