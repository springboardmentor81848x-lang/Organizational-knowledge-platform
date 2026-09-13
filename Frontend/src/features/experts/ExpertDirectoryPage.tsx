import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { expertsApi } from '@/api/experts'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProficiencyScale, PROFICIENCY_LEVELS, proficiencyLabel } from '@/components/ui/ProficiencyScale'
import { Table, type Column } from '@/components/ui/Table'
import type { Expert, ProficiencyLevel } from '@/types/api'
import styles from './ExpertDirectoryPage.module.css'

/**
 * Finding who knows what.
 *
 * The search runs only once a skill has been entered. Listing everybody by default would be a
 * staff directory rather than an answer to "who can help me with this", and the ranking the
 * server applies is meaningless without a skill to rank against.
 */
export function ExpertDirectoryPage() {
  const [term, setTerm] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [minProficiency, setMinProficiency] = useState<ProficiencyLevel | ''>('')

  const query = useQuery({
    queryKey: queryKeys.experts.search(submitted, minProficiency || undefined),
    queryFn: ({ signal }) =>
      expertsApi.search(submitted, minProficiency || undefined, signal),
    enabled: submitted.trim().length > 0,
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(term.trim())
  }

  const columns: Column<Expert>[] = [
    {
      key: 'person',
      header: 'Expert',
      render: (expert) => (
        <div className={styles.person}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(expert.fullName)}
          </span>
          <span className={styles.personMeta}>
            <span className={styles.personName}>{expert.fullName}</span>
            <a className={styles.personEmail} href={`mailto:${expert.email}`}>
              {expert.email}
            </a>
          </span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      width: '190px',
      render: (expert) => (
        <span className={styles.dept}>
          {expert.department ?? '—'}
          {expert.jobTitle && <span className={styles.jobTitle}>{expert.jobTitle}</span>}
        </span>
      ),
    },
    {
      key: 'skill',
      header: 'Skill',
      width: '150px',
      render: (expert) => expert.skillName,
    },
    {
      key: 'level',
      header: 'Proficiency',
      width: '230px',
      render: (expert) => <ProficiencyScale level={expert.proficiencyLevel} />,
    },
    {
      key: 'mentoring',
      header: 'Mentoring',
      width: '160px',
      render: (expert) => (
        <span className={styles.mentoring}>
          {expert.mentorRating != null ? (
            <>
              <strong className="tabular">{Math.round(expert.mentorRating * 10) / 10}/5</strong>
              <span className={styles.ratingCount}>
                from {expert.mentorRatingCount} rating{expert.mentorRatingCount === 1 ? '' : 's'}
              </span>
            </>
          ) : (
            <span className={styles.noRating}>Not yet rated</span>
          )}
          {expert.completedMentorships > 0 && (
            <span className={styles.ratingCount}>
              {expert.completedMentorships} mentorship
              {expert.completedMentorships === 1 ? '' : 's'} completed
            </span>
          )}
        </span>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Expert directory</h1>
        <p className={styles.subtitle}>
          Find colleagues who hold a skill, ranked by how far along they are and how their
          previous mentoring was rated.
        </p>
      </header>

      <Card>
        <form className={styles.search} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="skill">
              Skill
            </label>
            <input
              id="skill"
              className={styles.input}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="e.g. Kubernetes"
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="minProficiency">
              Minimum level
            </label>
            <select
              id="minProficiency"
              className={styles.select}
              value={minProficiency}
              onChange={(event) => setMinProficiency(event.target.value as ProficiencyLevel | '')}
            >
              <option value="">Any level</option>
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {proficiencyLabel(level)} and above
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary" disabled={!term.trim()}>
            Search
          </Button>
        </form>
      </Card>

      {submitted && (
        <Card flush>
          <Table
            columns={columns}
            rows={query.data}
            rowKey={(expert) => `${expert.employeeId}-${expert.skillId}`}
            isLoading={query.isLoading}
            error={query.error}
            onRetry={query.refetch}
            caption={`Colleagues who hold ${submitted}`}
            emptyTitle={`Nobody found for “${submitted}”`}
            emptyMessage={
              minProficiency
                ? `No colleague holds a matching skill at ${proficiencyLabel(
                    minProficiency,
                  )} or above. Try lowering the minimum level.`
                : 'No skill on record matches that name. The search matches part of a skill name, so try a shorter term.'
            }
          />
        </Card>
      )}
    </div>
  )
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
