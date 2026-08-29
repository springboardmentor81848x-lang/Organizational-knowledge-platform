import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assessmentsApi } from '@/api/assessments'
import { coursesApi } from '@/api/courses'
import { expertsApi } from '@/api/experts'
import { skillsApi } from '@/api/skills'
import { departmentHeadApi, managerApi } from '@/api/team'
import { queryKeys } from '@/api/queryKeys'
import { invalidateAfterAssessment, invalidateAfterEnrollmentChange } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PROFICIENCY_LEVELS, proficiencyLabel } from '@/components/ui/ProficiencyScale'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { ProficiencyLevel } from '@/types/api'
import type { TeamMemberSummary } from '@/types/analytics'
import type { Scope } from './TeamDashboardPage'
import styles from './TeamDashboardPage.module.css'

type Action = 'training' | 'mentorship' | 'assessment'

/**
 * The three things a manager does on somebody else's behalf.
 *
 * Each creates a real record owned by the employee — an enrolment, a mentorship, an assessment —
 * and each causes the server to notify them. The invalidation therefore targets the employee's
 * keys, not the manager's: it is the employee's dashboard, gaps and feed that have changed.
 */
export function AssignDialog({
  member,
  scope,
  onClose,
}: {
  member: TeamMemberSummary
  scope: Scope
  onClose: () => void
}) {
  const [action, setAction] = useState<Action>('training')

  return (
    <Modal
      open
      onClose={onClose}
      title={`Assign to ${member.fullName}`}
      description="Anything you assign here becomes theirs, and they are notified."
      size="md"
      footer={null}
    >
      <div className={styles.tabs} role="tablist">
        {(
          [
            ['training', 'Training'],
            ['mentorship', 'Mentor'],
            ['assessment', 'Assess them'],
          ] as [Action, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={action === id}
            className={[styles.tab, action === id ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setAction(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {action === 'training' && <AssignTraining member={member} scope={scope} onDone={onClose} />}
      {action === 'mentorship' && <AssignMentor member={member} scope={scope} onDone={onClose} />}
      {action === 'assessment' && <AssessMember member={member} onDone={onClose} />}
    </Modal>
  )
}

// ── Training ────────────────────────────────────────────────────────────────

function AssignTraining({
  member,
  scope,
  onDone,
}: {
  member: TeamMemberSummary
  scope: Scope
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [courseId, setCourseId] = useState<number | ''>('')

  const courses = useQuery({
    queryKey: queryKeys.courses.catalog(),
    queryFn: ({ signal }) => coursesApi.list(signal),
    retry: false,
  })

  const assign = useMutation({
    mutationFn: () =>
      (scope === 'manager' ? managerApi : departmentHeadApi).assignTraining(
        member.id,
        Number(courseId),
      ),
    onSuccess: async (enrollment) => {
      // The enrolment belongs to the employee, so it is their caches that are stale.
      await Promise.all([
        invalidateAfterEnrollmentChange(queryClient, member.id),
        queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
      ])
      toast.success(
        'Training assigned',
        `${member.fullName} has been enrolled in ${enrollment.trainingTitle} and notified.`,
      )
      onDone()
    },
    onError: (error) => toast.fromError('Could not assign the training', error),
  })

  return (
    <div className={styles.assignBody}>
      {assign.isError && <ErrorLine error={assign.error} />}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="course">
          Course
        </label>
        {courses.isError ? (
          <p className={styles.note}>
            The course catalog is not available to your role. {ApiError.from(courses.error).userMessage()}
          </p>
        ) : (
          <select
            id="course"
            className={styles.select}
            value={courseId}
            disabled={courses.isLoading}
            onChange={(event) => setCourseId(Number(event.target.value))}
          >
            <option value="">{courses.isLoading ? 'Loading…' : 'Choose a course…'}</option>
            {(courses.data ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
                {course.skillName ? ` — ${course.skillName}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className={styles.note}>
        They will be enrolled and told who assigned it. Re-assigning a course they already have in
        progress is refused by the server rather than creating a duplicate.
      </p>

      <div className={styles.assignActions}>
        <Button
          variant="primary"
          loading={assign.isPending}
          disabled={courseId === ''}
          onClick={() => assign.mutate()}
        >
          Assign training
        </Button>
      </div>
    </div>
  )
}

// ── Mentorship ──────────────────────────────────────────────────────────────

function AssignMentor({
  member,
  scope,
  onDone,
}: {
  member: TeamMemberSummary
  scope: Scope
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [skillId, setSkillId] = useState<number | ''>('')
  const [mentorId, setMentorId] = useState<number | ''>('')

  const skills = useQuery({
    queryKey: queryKeys.skills.catalog(),
    queryFn: ({ signal }) => skillsApi.list(signal),
  })

  const skillName = (skills.data ?? []).find((s) => s.id === Number(skillId))?.name ?? ''

  // Candidates come from the expert directory, which already ranks by proficiency and by how
  // previous mentoring was rated.
  const candidates = useQuery({
    queryKey: queryKeys.experts.search(skillName),
    queryFn: ({ signal }) => expertsApi.search(skillName, undefined, signal),
    enabled: skillName.length > 0,
  })

  const assign = useMutation({
    mutationFn: () =>
      (scope === 'manager' ? managerApi : departmentHeadApi).assignMentorship(
        member.id,
        Number(mentorId),
        Number(skillId),
      ),
    onSuccess: async (mentorship) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.mentorships.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
      ])
      toast.success(
        'Mentor assigned',
        `${mentorship.mentorName} is now mentoring ${member.fullName} in ${mentorship.skillName}. Both have been notified.`,
      )
      onDone()
    },
    onError: (error) => toast.fromError('Could not assign the mentor', error),
  })

  return (
    <div className={styles.assignBody}>
      {assign.isError && <ErrorLine error={assign.error} />}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="mentorSkill">
          Skill
        </label>
        <select
          id="mentorSkill"
          className={styles.select}
          value={skillId}
          onChange={(event) => {
            setSkillId(Number(event.target.value))
            setMentorId('')
          }}
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
        <label className={styles.label} htmlFor="mentor">
          Mentor
        </label>
        {skillId === '' ? (
          <p className={styles.note}>Choose a skill first to see who could mentor it.</p>
        ) : candidates.isLoading ? (
          <p className={styles.note}>Finding people who hold {skillName}…</p>
        ) : (candidates.data ?? []).filter((c) => c.employeeId !== member.id).length === 0 ? (
          <p className={styles.note}>
            Nobody on record holds {skillName}, so there is no one to pair them with.
          </p>
        ) : (
          <select
            id="mentor"
            className={styles.select}
            value={mentorId}
            onChange={(event) => setMentorId(Number(event.target.value))}
          >
            <option value="">Choose a mentor…</option>
            {(candidates.data ?? [])
              .filter((candidate) => candidate.employeeId !== member.id)
              .map((candidate) => (
                <option key={candidate.employeeId} value={candidate.employeeId}>
                  {candidate.fullName} — {proficiencyLabel(candidate.proficiencyLevel)}
                  {candidate.department ? ` · ${candidate.department}` : ''}
                </option>
              ))}
          </select>
        )}
      </div>

      <p className={styles.note}>
        A pairing you make starts active rather than waiting to be accepted, but the same rules
        apply: the server refuses a mentor who is not above them, or a second mentorship for a
        skill they are already being mentored in.
      </p>

      <div className={styles.assignActions}>
        <Button
          variant="primary"
          loading={assign.isPending}
          disabled={skillId === '' || mentorId === ''}
          onClick={() => assign.mutate()}
        >
          Assign mentor
        </Button>
      </div>
    </div>
  )
}

// ── Manager assessment ──────────────────────────────────────────────────────

/**
 * A MANAGER assessment of a direct report: the same two-step create-then-submit the assessment
 * module uses, carried out on somebody else's behalf.
 */
function AssessMember({ member, onDone }: { member: TeamMemberSummary; onDone: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [levels, setLevels] = useState<Record<number, ProficiencyLevel>>({})
  const [comments, setComments] = useState('')

  const skills = useQuery({
    queryKey: queryKeys.skills.forUser(member.id),
    queryFn: ({ signal }) => skillsApi.forUser(member.id, signal),
  })

  const submit = useMutation({
    mutationFn: async () => {
      const skillIds = Object.keys(levels).map(Number)
      const created = await assessmentsApi.create({
        employeeId: member.id,
        assessmentType: 'MANAGER',
        skillIds,
      })
      return assessmentsApi.submit(created.assessmentId, {
        results: skillIds.map((skillId) => ({ skillId, proficiency: levels[skillId] })),
        comments: comments.trim() || undefined,
      })
    },
    onSuccess: async (assessment) => {
      // The whole downstream chain belongs to the person assessed.
      await Promise.all([
        invalidateAfterAssessment(queryClient, member.id),
        queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
      ])
      const moved = assessment.results.filter((r) => (r.improvement ?? 0) !== 0).length
      toast.success(
        'Assessment submitted',
        moved > 0
          ? `${moved} skill level${moved > 1 ? 's' : ''} changed. Their gaps and recommendations have been recalculated.`
          : 'Levels confirmed. Their gaps have been recalculated.',
      )
      onDone()
    },
    onError: (error) => toast.fromError('Could not submit the assessment', error),
  })

  const chosen = Object.keys(levels).length

  return (
    <div className={styles.assignBody}>
      {submit.isError && <ErrorLine error={submit.error} />}

      {skills.isLoading ? (
        <p className={styles.note}>Loading their skills…</p>
      ) : (skills.data ?? []).length === 0 ? (
        <p className={styles.note}>
          {member.fullName} has no skills on record, so there is nothing to assess yet.
        </p>
      ) : (
        <ul className={styles.assessList}>
          {(skills.data ?? []).map((skill) => (
            <li className={styles.assessRow} key={skill.id}>
              <div className={styles.assessMeta}>
                <span className={styles.drillName}>{skill.skillName}</span>
                <span className={styles.drillMeta}>
                  Currently {proficiencyLabel(skill.proficiencyLevel)}
                </span>
              </div>
              <div className={styles.levelPicker}>
                {PROFICIENCY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={[
                      styles.levelButton,
                      levels[skill.skillId] === level ? styles.levelButtonActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={levels[skill.skillId] === level}
                    onClick={() =>
                      setLevels((current) => {
                        const next = { ...current }
                        if (next[skill.skillId] === level) delete next[skill.skillId]
                        else next[skill.skillId] = level
                        return next
                      })
                    }
                  >
                    {proficiencyLabel(level).slice(0, 4)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="assessComments">
          Comments (optional)
        </label>
        <textarea
          id="assessComments"
          className={styles.textarea}
          rows={2}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
        />
      </div>

      <div className={styles.assignActions}>
        <span className={styles.note}>
          {chosen === 0 ? 'No skills rated' : `${chosen} skill${chosen > 1 ? 's' : ''} rated`}
        </span>
        <Button
          variant="primary"
          loading={submit.isPending}
          disabled={chosen === 0}
          onClick={() => submit.mutate()}
        >
          Submit assessment
        </Button>
      </div>
    </div>
  )
}

function ErrorLine({ error }: { error: unknown }) {
  return (
    <div className={styles.error} role="alert">
      <span aria-hidden="true">!</span>
      <span>{ApiError.from(error).userMessage()}</span>
    </div>
  )
}
