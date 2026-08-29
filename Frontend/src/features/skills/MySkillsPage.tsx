import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { skillsApi } from '@/api/skills'
import { queryKeys } from '@/api/queryKeys'
import { invalidateEmployeeSkillGraph } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { ProficiencyScale, PROFICIENCY_LEVELS, proficiencyLabel } from '@/components/ui/ProficiencyScale'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import { PROFICIENCY_SCORE, type ProficiencyLevel, type UserSkill } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import styles from './MySkillsPage.module.css'

/**
 * The employee's skill inventory.
 *
 * Levels are self-declared here, which the page says plainly. A level that counts as evidence —
 * the kind that closes a gap on somebody else's judgement — is awarded by an assessment, and
 * conflating the two would let anyone mark themselves expert and call the gap closed.
 */
export function MySkillsPage() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<UserSkill | null>(null)
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
      render: (row) => <ProficiencyScale level={row.proficiencyLevel} />,
    },
    {
      key: 'score',
      header: 'Level',
      numeric: true,
      width: '90px',
      render: (row) => <span>{PROFICIENCY_SCORE[row.proficiencyLevel]} / 4</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '150px',
      render: (row) => (
        <div className={styles.rowActions}>
          <Button size="sm" variant="ghost" onClick={() => setEditing(row)}>
            Edit
          </Button>
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
            What you hold and at what level. These are your own declarations — an assessment is
            what turns a level into evidence.
          </p>
        </div>
        <Button variant="primary" onClick={() => setAdding(true)} disabled={!employeeId}>
          Add a skill
        </Button>
      </header>

      <Card flush>
        <Table
          columns={columns}
          rows={skills.data}
          rowKey={(row) => row.id}
          isLoading={skills.isLoading}
          error={skills.error}
          onRetry={skills.refetch}
          caption="Your recorded skills and proficiency levels"
          emptyTitle="No skills recorded"
          emptyMessage="Add the skills you work with so your gaps can be measured against your role."
        />
      </Card>

      {employeeId && (
        <>
          <SkillDialog
            open={adding}
            onClose={() => setAdding(false)}
            employeeId={employeeId}
            existing={skills.data ?? []}
          />
          <SkillDialog
            open={editing !== null}
            onClose={() => setEditing(null)}
            employeeId={employeeId}
            existing={skills.data ?? []}
            editingSkill={editing}
          />
        </>
      )}
    </div>
  )
}

/**
 * Adds or updates one entry. The same dialog does both because the fields are identical; only
 * the skill selector differs, and it is fixed once the record exists.
 */
function SkillDialog({
  open,
  onClose,
  employeeId,
  existing,
  editingSkill,
}: {
  open: boolean
  onClose: () => void
  employeeId: number
  existing: UserSkill[]
  editingSkill?: UserSkill | null
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const isEdit = Boolean(editingSkill)

  const [skillId, setSkillId] = useState<number | ''>('')
  const [level, setLevel] = useState<ProficiencyLevel>('BEGINNER')

  const catalog = useQuery({
    queryKey: queryKeys.skills.catalog(),
    queryFn: ({ signal }) => skillsApi.list(signal),
    // Only fetched when adding: editing cannot change which skill the record is for.
    enabled: open && !isEdit,
  })

  // Seed from whatever is being edited each time the dialog opens.
  const seedKey = editingSkill?.id ?? 'new'
  useMemo(() => {
    if (!open) return
    setSkillId(editingSkill?.skillId ?? '')
    setLevel(editingSkill?.proficiencyLevel ?? 'BEGINNER')
  }, [open, seedKey])

  /** Skills already on the profile cannot be added twice; the server rejects it too. */
  const available = useMemo(() => {
    const held = new Set(existing.map((s) => s.skillId))
    return (catalog.data ?? []).filter((skill) => !held.has(skill.id))
  }, [catalog.data, existing])

  const save = useMutation({
    mutationFn: () => {
      // ratingScore mirrors the canonical score of the level, so the two cannot disagree.
      const body = {
        skillId: Number(skillId),
        proficiencyLevel: level,
        ratingScore: PROFICIENCY_SCORE[level],
      }
      return isEdit
        ? skillsApi.updateForUser(employeeId, editingSkill!.id, body)
        : skillsApi.addToUser(employeeId, body)
    },
    onSuccess: async () => {
      // A level feeds gap analysis, recommendations, learning paths and every dashboard that
      // counts this person, so the whole derived graph is dropped rather than just the list.
      await invalidateEmployeeSkillGraph(queryClient, employeeId)
      toast.success(isEdit ? 'Skill updated' : 'Skill added')
      onClose()
    },
    onError: (error) => toast.fromError(isEdit ? 'Could not update' : 'Could not add', error),
  })

  const error = save.error ? ApiError.from(save.error) : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Update ${editingSkill?.skillName}` : 'Add a skill'}
      description={
        isEdit
          ? 'Change the level you hold this at.'
          : 'Record a skill you work with and how far along you are.'
      }
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={!isEdit && skillId === ''}
            onClick={() => save.mutate()}
          >
            {isEdit ? 'Save' : 'Add skill'}
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

      {!isEdit && (
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
            <p className={styles.hint}>
              Every skill in the catalog is already on your profile.
            </p>
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
      )}

      <fieldset className={styles.field}>
        <legend className={styles.label}>Your level</legend>
        <div className={styles.levelChoices}>
          {PROFICIENCY_LEVELS.map((option) => (
            <label
              key={option}
              className={[styles.levelChoice, level === option ? styles.levelChoiceActive : '']
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="radio"
                name="level"
                value={option}
                checked={level === option}
                onChange={() => setLevel(option)}
                className="visually-hidden"
              />
              <ProficiencyScale level={option} showLabel={false} compact />
              <span className={styles.levelName}>{proficiencyLabel(option)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </Modal>
  )
}
