import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/api/hr'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { useSession } from '@/features/auth/useSession'
import { roleLabel } from '@/app/roleRoutes'
import type { Role } from '@/types/api'
import type { EmployeeDirectoryRow } from '@/types/hr'
import styles from './Workforce.module.css'

const ROLES: Role[] = [
  'EMPLOYEE',
  'MANAGER',
  'DEPARTMENT_HEAD',
  'HR_SPECIALIST',
  'HR_ADMIN',
  'LND_ADMIN',
  'SYSTEM_ADMIN',
  'ADMIN',
]

/**
 * People and where they sit.
 *
 * This is the HR view of the directory, not the administrator's: it moves somebody between
 * departments and changes their job title, because those are organisational facts HR owns and
 * because a job title is what the gap analysis compares a person against. Roles are shown but
 * not editable here — a role is an authorisation decision, it is administered from the
 * administration section, and the endpoint that changes one refuses HR outright. Offering a
 * control that would come back 403 would be a worse answer than not offering it.
 */
export function PeopleAdminPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [editing, setEditing] = useState<EmployeeDirectoryRow | null>(null)

  // The filters are sent to the backend, which owns the search; the list is never filtered
  // client-side from a cached "all users" blob that could be stale.
  const filters = useMemo(
    () => ({ query: search.trim() || undefined, department: department || undefined, role: role || undefined }),
    [search, department, role],
  )

  const employees = useQuery({
    queryKey: queryKeys.hr.employees(filters),
    queryFn: ({ signal }) => hrApi.employees(filters, signal),
  })

  // Department options come from an unfiltered read, so narrowing to one department does not
  // shrink the list of departments you can switch back to.
  const everyone = useQuery({
    queryKey: queryKeys.hr.employees({}),
    queryFn: ({ signal }) => hrApi.employees({}, signal),
  })

  const departments = useMemo(() => {
    const seen = new Set<string>()
    for (const person of everyone.data ?? []) if (person.department) seen.add(person.department)
    return [...seen].sort()
  }, [everyone.data])

  const columns: Column<EmployeeDirectoryRow>[] = [
    {
      key: 'person',
      header: 'Person',
      render: (person) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{person.fullName}</span>
          <span className={styles.secondaryText}>{person.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: '170px',
      render: (person) => <span className={styles.secondaryText}>{roleLabel(person.role)}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      width: '190px',
      render: (person) =>
        person.department ? (
          person.department
        ) : (
          <span className={styles.muted}>Unassigned</span>
        ),
    },
    {
      key: 'title',
      header: 'Job title',
      render: (person) =>
        person.jobTitle ? (
          person.jobTitle
        ) : (
          <span className={styles.muted}>No title</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '110px',
      render: (person) => (
        <Button size="sm" onClick={() => setEditing(person)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card
        title="People & departments"
        description={
          employees.data
            ? `${employees.data.length} ${employees.data.length === 1 ? 'person' : 'people'} match.`
            : 'Search the directory and move people between departments.'
        }
        actions={
          <div className={styles.filters}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Name or email"
              aria-label="Search people"
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className={styles.select}
              value={department}
              aria-label="Filter by department"
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={role}
              aria-label="Filter by role"
              onChange={(event) => setRole(event.target.value as Role | '')}
            >
              <option value="">All roles</option>
              {ROLES.map((value) => (
                <option key={value} value={value}>
                  {roleLabel(value)}
                </option>
              ))}
            </select>
          </div>
        }
        flush
      >
        <Table
          columns={columns}
          rows={employees.data}
          rowKey={(person) => person.id}
          isLoading={employees.isLoading}
          error={employees.error}
          onRetry={employees.refetch}
          caption="Employee directory"
          emptyTitle="Nobody matches"
          emptyMessage="Clear the filters to see the whole directory."
        />
      </Card>

      {editing && (
        <AssignmentDialog
          person={editing}
          departments={departments}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

/**
 * Moving somebody's department or title.
 *
 * A department change moves which role competency profile the person is measured against, so it
 * changes their gaps and everything computed from them. The mutation therefore invalidates the
 * organisation views, the department views and that person's own skill graph — the employee's
 * own screens must not keep showing gaps measured against the department they just left.
 */
function AssignmentDialog({
  person,
  departments,
  onClose,
}: {
  person: EmployeeDirectoryRow
  departments: string[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { user } = useSession()
  const [department, setDepartment] = useState(person.department ?? '')
  const [jobTitle, setJobTitle] = useState(person.jobTitle ?? '')

  const save = useMutation({
    mutationFn: () =>
      hrApi.updateAssignment(person.id, {
        department: department.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
      }),
    onError: (error) => toast.fromError('Could not update the assignment', error),
    onSuccess: (updated) => {
      toast.success(
        'Assignment updated',
        `${updated.fullName} is now ${updated.jobTitle ?? 'untitled'} in ${
          updated.department ?? 'no department'
        }.`,
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.gaps.forUser(person.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.forUser(person.id) })
      // Their own profile screen, if the person moved is the one signed in.
      if (user?.id === person.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.session })
      }
      onClose()
    },
  })

  const unchanged =
    department.trim() === (person.department ?? '') && jobTitle.trim() === (person.jobTitle ?? '')

  return (
    <Modal
      open
      onClose={onClose}
      title={person.fullName}
      description={`${person.email} · ${roleLabel(person.role)}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={unchanged}
            onClick={() => save.mutate()}
          >
            Save assignment
          </Button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Department</span>
          <input
            className={styles.input}
            list="workforce-departments"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="Unassigned"
          />
          <datalist id="workforce-departments">
            {departments.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Job title</span>
          <input
            className={styles.input}
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="No title"
          />
        </label>
      </div>

      <p className={styles.dialogNote}>
        The job title and department together decide which role competency profile this person is
        measured against, so changing either changes their gap analysis. Their role —{' '}
        <strong>{roleLabel(person.role)}</strong> — decides what they may see, and is changed from
        the administration section rather than here.
      </p>

    </Modal>
  )
}
