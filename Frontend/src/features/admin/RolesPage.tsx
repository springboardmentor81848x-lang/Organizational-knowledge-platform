import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { Modal } from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { roleLabel } from '@/app/roleRoutes'
import type { Role } from '@/types/api'
import type { EndpointPermission, RoleEntity } from '@/types/admin'
import styles from './Admin.module.css'

const BUILT_IN_ROLES: Role[] = [
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
 * Roles, and what they actually permit.
 *
 * The permission matrix is not written down here. This platform has no permission table:
 * authorization is the rules declared on the endpoints, and those rules are what decide every
 * request. So the server reads them back off itself and this screen renders them. A matrix
 * maintained separately would be a second account of the rules, free to drift from the one doing
 * the work, and wrong in exactly the way nobody notices.
 *
 * The registry below it is editable but descriptive: adding a row there does not grant anything.
 * That is said plainly rather than left for an administrator to discover.
 */
export function RolesPage() {
  const [area, setArea] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [editing, setEditing] = useState<RoleEntity | 'new' | null>(null)

  const permissions = useQuery({
    queryKey: queryKeys.admin.permissions(),
    queryFn: ({ signal }) => adminApi.permissions(signal),
  })

  const roles = useQuery({
    queryKey: queryKeys.admin.roles(),
    queryFn: ({ signal }) => adminApi.roles(signal),
  })

  const areas = useMemo(
    () => [...new Set((permissions.data ?? []).map((row) => row.area))].sort(),
    [permissions.data],
  )

  const rows = useMemo(
    () =>
      (permissions.data ?? []).filter((row) => {
        if (area && row.area !== area) return false
        if (role && !admits(row, role)) return false
        return true
      }),
    [permissions.data, area, role],
  )

  /** How many endpoints each role can reach, counted from the rules themselves. */
  const reach = useMemo(() => {
    const counts = new Map<Role, number>()
    for (const value of BUILT_IN_ROLES) {
      counts.set(value, (permissions.data ?? []).filter((row) => admits(row, value)).length)
    }
    return counts
  }, [permissions.data])

  const permissionColumns: Column<EndpointPermission>[] = [
    { key: 'area', header: 'Area', width: '140px', render: (row) => row.area },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (row) => (
        <span className={styles.endpoint}>
          <span className={styles.method}>{row.method}</span> {row.path}
        </span>
      ),
    },
    {
      key: 'who',
      header: 'Who may call it',
      render: (row) => <Admits row={row} />,
    },
  ]

  const roleColumns: Column<RoleEntity>[] = [
    { key: 'name', header: 'Name', render: (entry) => <span className={styles.primaryText}>{entry.name}</span> },
    {
      key: 'description',
      header: 'Description',
      render: (entry) => entry.description ?? <span className={styles.muted}>No description</span>,
    },
    {
      key: 'active',
      header: 'Status',
      width: '120px',
      render: (entry) =>
        entry.active ? (
          <span className={styles.statusActive}>Active</span>
        ) : (
          <span className={styles.statusInactive}>Inactive</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '90px',
      render: (entry) => (
        <Button size="sm" onClick={() => setEditing(entry)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card
        title="What each role can reach"
        description="Counted from the authorization rules the running server is enforcing, not from a list kept beside them."
      >
        {permissions.isLoading ? (
          <LoadingBlock rows={3} label="Reading the authorization rules" />
        ) : permissions.isError ? (
          isPermissionDenied(permissions.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={permissions.error} onRetry={permissions.refetch} />
          )
        ) : (
          <dl className={styles.reachGrid}>
            {BUILT_IN_ROLES.map((value) => (
              <div key={value}>
                <dt className={styles.statLabel}>{roleLabel(value)}</dt>
                <dd className={styles.statValue}>
                  <span className="tabular">{reach.get(value) ?? 0}</span>
                  <span className={styles.statSuffix}>of {permissions.data?.length ?? 0}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <Card
        title="Permission rules"
        description="Every endpoint and the rule that guards it. Filter by role to see exactly what that role may do."
        actions={
          <div className={styles.filters}>
            <select
              className={styles.select}
              value={role}
              aria-label="Filter by role"
              onChange={(event) => setRole(event.target.value as Role | '')}
            >
              <option value="">Any role</option>
              {BUILT_IN_ROLES.map((value) => (
                <option key={value} value={value}>
                  Reachable by {roleLabel(value)}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={area}
              aria-label="Filter by area"
              onChange={(event) => setArea(event.target.value)}
            >
              <option value="">All areas</option>
              {areas.map((name) => (
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
          columns={permissionColumns}
          rows={rows}
          rowKey={(row) => `${row.method} ${row.path}`}
          isLoading={permissions.isLoading}
          error={permissions.error}
          onRetry={permissions.refetch}
          caption="Endpoint permission rules"
          emptyTitle="No endpoints match"
          emptyMessage="Clear the filters to see every rule."
        />
      </Card>

      <Card
        title="Role registry"
        description="A descriptive list of roles. Editing it records intent; it does not itself grant access."
        actions={
          <Button variant="primary" onClick={() => setEditing('new')}>
            New entry
          </Button>
        }
        flush
      >
        <Table
          columns={roleColumns}
          rows={roles.data}
          rowKey={(entry) => entry.id}
          isLoading={roles.isLoading}
          error={roles.error}
          onRetry={roles.refetch}
          caption="Role registry"
          emptyTitle="The registry is empty"
          emptyMessage="The eight built-in roles above are what the server enforces. This registry is for recording roles the organisation wants described alongside them."
        />
      </Card>

      {editing && (
        <RoleDialog entry={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

/** Whether a rule lets a given role through. */
function admits(row: EndpointPermission, role: Role): boolean {
  if (row.anyAuthenticated) return true
  return row.roles.includes(role)
}

function Admits({ row }: { row: EndpointPermission }) {
  if (row.anyAuthenticated) {
    return (
      <span className={styles.secondaryText}>
        Anyone signed in
        {row.selfPermitted && <span className={styles.selfNote}> · and the subject themselves</span>}
      </span>
    )
  }
  if (row.roles.length === 0) {
    // A rule the summary could not reduce is shown as written rather than guessed at.
    return <code className={styles.rawRule}>{row.rawRule}</code>
  }
  return (
    <span className={styles.roleChips}>
      {row.roles.map((name) => (
        <span className={styles.chip} key={name}>
          {name}
        </span>
      ))}
      {row.selfPermitted && <span className={styles.selfNote}>or the subject themselves</span>}
    </span>
  )
}

function RoleDialog({ entry, onClose }: { entry: RoleEntity | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [name, setName] = useState(entry?.name ?? '')
  const [description, setDescription] = useState(entry?.description ?? '')
  const [active, setActive] = useState(entry?.active ?? true)

  const save = useMutation({
    mutationFn: () =>
      entry
        ? adminApi.updateRoleEntity(entry.id, { name, description, active })
        : adminApi.createRoleEntity({ name, description, active }),
    onError: (error) => toast.fromError('The entry could not be saved', error),
    onSuccess: (saved) => {
      toast.success(entry ? 'Registry entry updated' : 'Registry entry created', saved.name)
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles() })
      onClose()
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={entry ? entry.name : 'New registry entry'}
      description="Descriptive only — this does not change what anybody may do."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={name.trim().length === 0}
            onClick={() => save.mutate()}
          >
            {entry ? 'Save changes' : 'Create entry'}
          </Button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Name</span>
          <input
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Description</span>
          <textarea
            className={styles.textarea}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          <span>Active</span>
        </label>
      </div>

      <p className={styles.dialogNote}>
        Access is decided by the role on a person&rsquo;s account and the endpoint rules above.
        To change what somebody may do, change their role under Users.
      </p>
    </Modal>
  )
}
