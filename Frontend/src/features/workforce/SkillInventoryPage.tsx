import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/api/hr'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { ProficiencyScale } from '@/components/ui/ProficiencyScale'
import { Table, type Column } from '@/components/ui/Table'
import type { ProficiencyLevel } from '@/types/api'
import type { SkillInventoryRow } from '@/types/hr'
import styles from './Workforce.module.css'

/**
 * What the workforce actually holds, skill by skill.
 *
 * Headcount and average level are separate answers and are shown separately. A skill two people
 * hold at EXPERT and a skill forty people hold at BEGINNER are different problems, and an
 * average alone would hide which one is in front of you.
 *
 * A skill nobody has on file shows a headcount of zero and no bar at all, rather than a bar at
 * UNAWARE: the backend averages over nobody there, and drawing a level would be inventing one.
 */
export function SkillInventoryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const inventory = useQuery({
    queryKey: queryKeys.hr.skillInventory(),
    queryFn: ({ signal }) => hrApi.skillInventory(signal),
  })

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const row of inventory.data ?? []) if (row.category) seen.add(row.category)
    return [...seen].sort()
  }, [inventory.data])

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (inventory.data ?? []).filter(
      (row) =>
        (!term || row.skillName.toLowerCase().includes(term)) &&
        (!category || row.category === category),
    )
  }, [inventory.data, search, category])

  const covered = (inventory.data ?? []).filter((row) => row.headcount > 0).length
  const uncovered = (inventory.data ?? []).length - covered

  const columns: Column<SkillInventoryRow>[] = [
    {
      key: 'skill',
      header: 'Skill',
      render: (row) => <span className={styles.primaryText}>{row.skillName}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      width: '150px',
      render: (row) =>
        row.category ? (
          <span className={styles.secondaryText}>{row.category}</span>
        ) : (
          <span className={styles.muted}>Uncategorised</span>
        ),
    },
    {
      key: 'headcount',
      header: 'People holding it',
      numeric: true,
      width: '140px',
      render: (row) =>
        row.headcount === 0 ? (
          <span className={styles.muted}>None</span>
        ) : (
          <span className="tabular">{row.headcount}</span>
        ),
    },
    {
      key: 'level',
      header: 'Average level',
      width: '230px',
      render: (row) =>
        row.headcount === 0 ? (
          <span className={styles.muted}>Nobody to average</span>
        ) : (
          <div className={styles.levelCell}>
            <ProficiencyScale level={row.averageProficiencyLabel as ProficiencyLevel} compact />
            <span className={styles.levelScore}>{row.averageProficiency.toFixed(2)}</span>
          </div>
        ),
    },
  ]

  return (
    <Card
      title="Workforce skill inventory"
      description={
        inventory.data
          ? `${covered} of ${inventory.data.length} catalogued skills are held by somebody; ${uncovered} are held by nobody at all.`
          : 'Every catalogued skill, and how much of it the organisation has.'
      }
      actions={
        <div className={styles.filters}>
          <input
            className={styles.input}
            type="search"
            value={search}
            placeholder="Search skills"
            aria-label="Search skills"
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={styles.select}
            value={category}
            aria-label="Filter by category"
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      }
      flush
    >
      <Table
        columns={columns}
        rows={rows}
        rowKey={(row) => row.skillId}
        isLoading={inventory.isLoading}
        error={inventory.error}
        onRetry={inventory.refetch}
        caption="Workforce skill inventory"
        emptyTitle={search || category ? 'No skills match' : 'No skills catalogued'}
        emptyMessage={
          search || category
            ? 'Clear the search or the category filter to see the whole inventory.'
            : 'Skills appear here once they exist in the skill catalogue.'
        }
      />
    </Card>
  )
}
