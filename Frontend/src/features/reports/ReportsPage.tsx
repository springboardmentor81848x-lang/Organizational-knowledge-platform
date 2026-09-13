import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { hrApi } from '@/api/hr'
import { queryKeys } from '@/api/queryKeys'
import { reportsApi, type ReportFormat } from '@/api/reports'
import { departmentHeadApi, managerApi } from '@/api/team'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { useToast } from '@/components/ui/Toast'
import { useSession } from '@/features/auth/useSession'
import { saveFile } from '@/lib/download'
import type { Role } from '@/types/api'
import styles from './ReportsPage.module.css'

/**
 * Report generation.
 *
 * Every button here asks the backend to build a document from live queries at the moment it is
 * pressed, and hands back the file the server produced. Nothing is rendered, printed or
 * screenshotted on the client, and nothing is generated ahead of time and kept: a report and the
 * dashboard beside it are two renderings of the same query, which is the only way they can be
 * relied upon to agree.
 *
 * The reports offered follow the caller's own scope. The backend refuses a report the caller
 * could not have opened as a dashboard — the report layer is built on the same analytics
 * service, so it cannot disclose more than the screen already would — and this page picks the
 * people and departments it offers from whichever directory endpoint that role can actually
 * call, rather than offering a list that would come back refused.
 */

const ORG_WIDE_ROLES: Role[] = ['HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN']

/** The only two things this page needs about a person, whichever directory they came from. */
interface ReportSubject {
  id: number
  name: string
  department: string | null
}

export function ReportsPage() {
  const { user, role } = useSession()
  const toast = useToast()
  const [running, setRunning] = useState<string | null>(null)

  const orgWide = role ? ORG_WIDE_ROLES.includes(role) : false
  const isManager = role === 'MANAGER'

  // The people this role may report on come from the endpoint scoped to that role. A manager
  // gets their direct reports because of who they are; HR gets the directory. The three shapes
  // are narrowed to the two fields this page needs, so the union never leaks past here.
  const people = useQuery<ReportSubject[]>({
    queryKey: orgWide
      ? queryKeys.hr.employees({})
      : isManager
        ? queryKeys.team.members('manager')
        : queryKeys.team.members('department'),
    queryFn: async ({ signal }) => {
      const rows = orgWide
        ? await hrApi.employees({}, signal)
        : isManager
          ? await managerApi.team(signal)
          : await departmentHeadApi.department(signal)
      return rows.map((person) => ({
        id: person.id,
        name: person.fullName,
        department: person.department,
      }))
    },
  })

  const roster = people.data ?? []

  const departments = useMemo(() => {
    const seen = new Set<string>()
    for (const person of roster) if (person.department) seen.add(person.department)
    if (user?.department) seen.add(user.department)
    return [...seen].sort()
  }, [roster, user])

  const [employeeId, setEmployeeId] = useState<string>('')
  const [department, setDepartment] = useState<string>('')

  const selectedEmployee = employeeId || (roster[0]?.id ? String(roster[0].id) : '')
  const selectedDepartment = department || departments[0] || ''

  const generate = useMutation({
    mutationFn: async ({
      key,
      run,
    }: {
      key: string
      run: () => Promise<{ blob: Blob; filename: string }>
    }) => {
      setRunning(key)
      return run()
    },
    onSuccess: (file) => {
      saveFile(file)
      toast.success('Report generated', `${file.filename} was built from live data and downloaded.`)
    },
    onError: (error) => toast.fromError('The report could not be generated', error),
    onSettled: () => setRunning(null),
  })

  function run(key: string, task: () => Promise<{ blob: Blob; filename: string }>) {
    generate.mutate({ key, run: task })
  }

  if (people.isError && !isPermissionDenied(people.error)) {
    return (
      <Card flush>
        <ErrorBlock error={people.error} onRetry={people.refetch} />
      </Card>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.subtitle}>
          Each report is built by the server from live queries when you ask for it, and downloaded
          as the file it generated. The figures in a report are the figures on the dashboards,
          because both are the same query.
        </p>
      </header>

      <Card
        title="Employee learning report"
        description="One person's skills, gaps, training and assessment history."
      >
        {people.isLoading ? (
          <LoadingBlock rows={2} label="Loading the people you may report on" />
        ) : people.isError ? (
          <PermissionDenied message="Your role cannot list people, so an employee report cannot be chosen here." />
        ) : roster.length === 0 ? (
          <p className={styles.note}>
            There is nobody in your scope to report on yet. People appear here once they report to
            you or share your department.
          </p>
        ) : (
          <div className={styles.controlRow}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Employee</span>
              <select
                className={styles.select}
                value={selectedEmployee}
                onChange={(event) => setEmployeeId(event.target.value)}
              >
                {roster.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                    {person.department ? ` — ${person.department}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <FormatButtons
              disabled={!selectedEmployee}
              busyFormat={running?.startsWith('employee:') ? running.split(':')[1] : null}
              onGenerate={(format) =>
                run(`employee:${format}`, () =>
                  reportsApi.employeeLearning(Number(selectedEmployee), format),
                )
              }
            />
          </div>
        )}
      </Card>

      <Card
        title="Department training report"
        description="Training reach, completion and skill movement across one department."
      >
        {departments.length === 0 ? (
          <p className={styles.note}>
            No department is in your scope yet, so there is nothing to report on.
          </p>
        ) : (
          <div className={styles.controlRow}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Department</span>
              <select
                className={styles.select}
                value={selectedDepartment}
                onChange={(event) => setDepartment(event.target.value)}
              >
                {departments.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <FormatButtons
              disabled={!selectedDepartment}
              busyFormat={running?.startsWith('department:') ? running.split(':')[1] : null}
              onGenerate={(format) =>
                run(`department:${format}`, () =>
                  reportsApi.departmentTraining(selectedDepartment, format),
                )
              }
            />
          </div>
        )}
      </Card>

      <Card
        title="Skill gap & training effectiveness report"
        description="Every skill with a role requirement, how far the workforce sits from it, and where the shortfall is concentrated."
      >
        <div className={styles.controlRow}>
          <p className={styles.note}>
            Organisation-wide. The same rows the gap intelligence screen shows, generated fresh.
          </p>
          <FormatButtons
            busyFormat={running?.startsWith('skill-gap:') ? running.split(':')[1] : null}
            onGenerate={(format) =>
              run(`skill-gap:${format}`, () => reportsApi.skillGap(format))
            }
          />
        </div>
      </Card>
    </div>
  )
}

function FormatButtons({
  onGenerate,
  busyFormat,
  disabled = false,
}: {
  onGenerate: (format: ReportFormat) => void
  busyFormat: string | null
  disabled?: boolean
}) {
  return (
    <div className={styles.actions}>
      <Button
        variant="primary"
        disabled={disabled}
        loading={busyFormat === 'pdf'}
        onClick={() => onGenerate('pdf')}
      >
        Generate PDF
      </Button>
      <Button
        disabled={disabled}
        loading={busyFormat === 'excel'}
        onClick={() => onGenerate('excel')}
      >
        Generate Excel
      </Button>
    </div>
  )
}
