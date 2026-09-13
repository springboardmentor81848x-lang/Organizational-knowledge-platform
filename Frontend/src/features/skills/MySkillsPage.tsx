import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { skillsApi } from '@/api/skills'
import { queryKeys } from '@/api/queryKeys'
import { invalidateEmployeeSkillGraph } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { ProficiencyScale } from '@/components/ui/ProficiencyScale'
import { StatusPill } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import { PROFICIENCY_SCORE, type UserSkill } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import styles from './MySkillsPage.module.css'

/**
 * The employee's skill inventory.
 *
 * <h2>Why there is no level to pick here any more</h2>
 * Adding a skill used to mean declaring a level for it, and that level went straight into the
 * gap heatmap a manager reads and the figures that decide what training gets bought. A level
 * somebody awards themselves is a claim, not evidence for one, and nothing on the screen
 * distinguished the two once they were in the same column.
 *
 * So adding a skill now says only that the skill is part of your work. It arrives awaiting
 * assessment, and the assessment covering it is offered straight away — once that is marked, the
 * level, the gap and the heatmap cell all move together and all of them mean the same thing.
 */
export function MySkillsPage() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [adding, setAdding] = useState(false)

  const employeeId = user?.id

  const skills = useQuery({
    queryKey: queryKeys.skills.forUser(employeeId!),
    queryFn: ({ signal }) => skillsApi.forUser(employeeId!, signal),
    enabled: Boolean(employeeId),
  })

  const remove = useMutation({
    mutationFn: (userSkillId: number) => skillsApi.removeFromUser(employeeId!, userSkillId),
    onSuccess: async () => {
      await invalidateEmployeeSkillGraph(queryClient, employeeId!)
      toast.success('Skill removed')
    },
    onError: (error) => toast.fromError('Could not remove that skill', error),
  })

  const awaiting = (skills.data ?? []).filter((skill) => skill.awaitingAssessment)

  const columns: Column<UserSkill>[] = [
    {
      key: 'skill',
      header: 'Skill',
      render: (row) => (
        <div className={styles.skillCell}>
          <span className={styles.skillName}>{row.skillName}</span>
          {row.skillCategory && <span className={styles.category}>{row.skillCategory}</span>}
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Proficiency',
      width: '260px',
      // An unassessed skill shows no bar at all. Rendering UNAWARE would say the assessment had
      // been taken and gone badly, which is a very different thing to tell somebody.
      render: (row) =>
        row.awaitingAssessment ? (
          <StatusPill value="PENDING" tone="medium" label="Awaiting assessment" />
        ) : (
          <ProficiencyScale level={row.proficiencyLevel} />
        ),
    },
    {
      key: 'score',
      header: 'Level',
      numeric: true,
      width: '90px',
      render: (row) =>
        row.awaitingAssessment ? (
          <span className={styles.muted}>—</span>
        ) : (
          <span>{PROFICIENCY_SCORE[row.proficiencyLevel]} / 4</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '110px',
      render: (row) => (
        <div className={styles.rowActions}>
          <Button
            size="sm"
            variant="ghost"
            loading={remove.isPending && remove.variables === row.id}
            onClick={() => remove.mutate(row.id)}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My skills</h1>
          <p className={styles.subtitle}>
            The skills your work involves. Adding one records that it is part of your job; the
            level comes from the assessment that measures it, never from what you enter here.
          </p>
        </div>
        <Button variant="primary" onClick={() => setAdding(true)} disabled={!employeeId}>
          Add a skill
        </Button>
      </header>

      {awaiting.length > 0 && (
        <Card className={styles.prompt}>
          <div className={styles.promptRow}>
            <div>
              <h2 className={styles.promptTitle}>
                {awaiting.length} skill{awaiting.length === 1 ? '' : 's'} awaiting assessment
              </h2>
              <p className={styles.promptText}>
                {awaiting.map((skill) => skill.skillName).join(', ')}
                {' — '}
                until these are assessed they sit at no level, so they cannot close a gap or
                appear as strength on anyone's heatmap. The assessment covering them takes only
                those skills, and does not touch the levels you have already been measured at.
              </p>
            </div>
            <Link className={styles.promptAction} to="/assessments">
              Take the assessment
            </Link>
          </div>
        </Card>
      )}

      <Card flush>
        <Table
          columns={columns}
          rows={skills.data}
          rowKey={(row) => row.id}
          isLoading={skills.isLoading}
          error={skills.error}
          onRetry={skills.refetch}
          caption="Your recorded skills and their assessed levels"
          emptyTitle="No skills recorded"
          emptyMessage="Add the skills you work with so your gaps can be measured against your role."
        />
      </Card>

      {employeeId && (
        <AddSkillDialog
          open={adding}
          onClose={() => setAdding(false)}
          employeeId={employeeId}
          existing={skills.data ?? []}
        />
      )}
    </div>
  )
}

/**
 * Puts one skill on the profile.
 *
 * A single field, because there is only one thing to say. The dialog that used to be here also
 * asked for a level and doubled as an editor for existing entries; both went with the level
 * itself — there is nothing left to edit, and a skill that does not belong is removed rather
 * than corrected.
 */
function AddSkillDialog({
  open,
  onClose,
  employeeId,
  existing,
}: {
  open: boolean
  onClose: () => void
  employeeId: number
  existing: UserSkill[]
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [skillId, setSkillId] = useState<number | ''>('')

  const catalog = useQuery({
    queryKey: queryKeys.skills.catalog(),
    queryFn: ({ signal }) => skillsApi.list(signal),
    enabled: open,
  })

  // Cleared each time the dialog opens, so a skill picked and cancelled is not still selected
  // the next time round.
  useEffect(() => {
    if (open) setSkillId('')
  }, [open])

  /** Skills already on the profile cannot be added twice; the server rejects it too. */
  const available = useMemo(() => {
    const held = new Set(existing.map((s) => s.skillId))
    return (catalog.data ?? []).filter((skill) => !held.has(skill.id))
  }, [catalog.data, existing])

  const save = useMutation({
    mutationFn: () => skillsApi.addToUser(employeeId, Number(skillId)),
    onSuccess: async () => {
      // A new skill changes what is measured, so gaps, recommendations, learning paths and every
      // dashboard counting this person are dropped rather than just the list.
      await invalidateEmployeeSkillGraph(queryClient, employeeId)
      // The assessment on offer changes too: there is now something unassessed to sit.
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all })
      toast.success('Skill added', 'Take the assessment covering it to have it measured.')
      onClose()
    },
    onError: (error) => toast.fromError('Could not add that skill', error),
  })

  const error = save.error ? ApiError.from(save.error) : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a skill"
      description="Record a skill your work involves. Its level comes from the assessment, not from here."
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={skillId === ''}
            onClick={() => save.mutate()}
          >
            Add skill
          </Button>
        </>
      }
    >
      {error && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          <span>{error.userMessage()}</span>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="skill">
          Skill
        </label>
        {catalog.isLoading ? (
          <p className={styles.hint}>Loading the skill catalog…</p>
        ) : catalog.isError ? (
          <p className={styles.hint}>
            The skill catalog could not be loaded. {ApiError.from(catalog.error).userMessage()}
          </p>
        ) : available.length === 0 ? (
          <p className={styles.hint}>Every skill in the catalog is already on your profile.</p>
        ) : (
          <select
            id="skill"
            className={styles.select}
            value={skillId}
            onChange={(event) => setSkillId(Number(event.target.value))}
          >
            <option value="">Choose a skill…</option>
            {available.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
                {skill.category ? ` — ${skill.category}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className={styles.hint}>
        It will be added awaiting assessment. Nothing you enter sets a proficiency level — that is
        what the assessment is for.
      </p>
    </Modal>
  )
}
