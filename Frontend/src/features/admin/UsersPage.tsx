import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { useSession } from '@/features/auth/useSession'
import { roleLabel } from '@/app/roleRoutes'
import type { Role, UserProfile } from '@/types/api'
import styles from './Admin.module.css'

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
 * Accounts.
 *
 * Deactivating is a real revocation, not a label: the account cannot sign in, and every request
 * carrying a token issued before the change is refused from that moment. The dialog says so,
 * because an administrator needs to know whether the person is out now or out when their session
 * happens to lapse.
 *
 * Changing a role changes what the person may see everywhere, so the mutation clears the whole
 * cache for them rather than only this table.
 */
export function UsersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [role, setRole] = useState<Role | ''>('')
  const [editing, setEditing] = useState<UserProfile | null>(null)

  const users = useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: ({ signal }) => adminApi.users(signal),
  })

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (users.data ?? []).filter((user) => {
      if (status === 'active' && !user.active) return false
      if (status === 'inactive' && user.active) return false
      if (role && user.role !== role) return false
      if (!term) return true
      return (
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.department ?? '').toLowerCase().includes(term)
      )
    })
  }, [users.data, search, status, role])

  const deactivated = (users.data ?? []).filter((user) => !user.active).length

  const columns: Column<UserProfile>[] = [
    {
      key: 'person',
      header: 'Account',
      render: (user) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{user.fullName}</span>
          <span className={styles.secondaryText}>{user.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: '170px',
      render: (user) => <span className={styles.secondaryText}>{roleLabel(user.role)}</span>,
    },
    {
      key: 'where',
      header: 'Department',
      width: '190px',
      render: (user) =>
        user.department ? user.department : <span className={styles.muted}>Unassigned</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (user) =>
        user.active ? (
          <span className={styles.statusActive}>Active</span>
        ) : (
          <span className={styles.statusInactive}>Deactivated</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '110px',
      render: (user) => (
        <Button size="sm" onClick={() => setEditing(user)}>
          Manage
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card
        title="User accounts"
        description={
          users.data
            ? `${users.data.length} accounts${deactivated > 0 ? `, ${deactivated} deactivated` : ''}.`
            : 'Every account on the platform.'
        }
        actions={
          <div className={styles.filters}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Name, email or department"
              aria-label="Search accounts"
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className={styles.select}
              value={status}
              aria-label="Filter by status"
              onChange={(event) => setStatus(event.target.value as typeof status)}
            >
              <option value="all">All accounts</option>
              <option value="active">Active only</option>
              <option value="inactive">Deactivated only</option>
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
          rows={rows}
          rowKey={(user) => user.id}
          isLoading={users.isLoading}
          error={users.error}
          onRetry={users.refetch}
          caption="User accounts"
          emptyTitle="No accounts match"
          emptyMessage="Clear the filters to see every account."
        />
      </Card>

      {editing && <AccountDialog user={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function AccountDialog({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { user: signedIn } = useSession()
  const [role, setRole] = useState<Role>(user.role)

  const isSelf = signedIn?.id === user.id

  function refreshEverything() {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
    // A role or a revocation changes what this person may see anywhere in the product, and the
    // directories that list them elsewhere.
    queryClient.invalidateQueries({ queryKey: queryKeys.hr.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
  }

  const changeRole = useMutation({
    mutationFn: () => adminApi.updateRole(user.id, { role }),
    onError: (error) => toast.fromError('The role could not be changed', error),
    onSuccess: (updated) => {
      toast.success('Role changed', `${updated.fullName} is now ${roleLabel(updated.role)}.`)
      refreshEverything()
      onClose()
    },
  })

  const changeStatus = useMutation({
    mutationFn: (active: boolean) => adminApi.updateStatus(user.id, { active }),
    onError: (error) => toast.fromError('The account status could not be changed', error),
    onSuccess: (updated) => {
      toast.success(
        updated.active ? 'Account reactivated' : 'Account deactivated',
        updated.active
          ? `${updated.fullName} can sign in again.`
          : `${updated.fullName} is signed out everywhere and cannot sign in.`,
      )
      refreshEverything()
      onClose()
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={user.fullName}
      description={`${user.email} · ${user.jobTitle ?? 'no job title'}${
        user.department ? ` · ${user.department}` : ''
      }`}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <section className={styles.dialogSection}>
        <h3 className={styles.subheading}>Role</h3>
        <div className={styles.controlRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Assigned role</span>
            <select
              className={styles.select}
              value={role}
              disabled={isSelf}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              {ROLES.map((value) => (
                <option key={value} value={value}>
                  {roleLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="primary"
            disabled={isSelf || role === user.role}
            loading={changeRole.isPending}
            onClick={() => changeRole.mutate()}
          >
            Change role
          </Button>
        </div>
        <p className={styles.dialogNote}>
          The role decides what this account may reach. What each role admits is listed under
          Roles &amp; permissions, read from the rules the server enforces.
          {isSelf && ' You cannot change your own role from here.'}
        </p>
      </section>

      <section className={styles.dialogSection}>
        <h3 className={styles.subheading}>Access</h3>
        {user.active ? (
          <>
            <Button
              variant="danger"
              disabled={isSelf}
              loading={changeStatus.isPending}
              onClick={() => changeStatus.mutate(false)}
            >
              Deactivate account
            </Button>
            <p className={styles.dialogNote}>
              Takes effect immediately. The account cannot sign in, and any session already open
              is refused on its next request rather than lasting until the token expires.
              {isSelf && ' You cannot deactivate your own account.'}
            </p>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              loading={changeStatus.isPending}
              onClick={() => changeStatus.mutate(true)}
            >
              Reactivate account
            </Button>
            <p className={styles.dialogNote}>
              This account is deactivated. Reactivating restores sign-in; nothing about the
              account&rsquo;s history, skills or enrolments was lost while it was off.
            </p>
          </>
        )}
      </section>
    </Modal>
  )
}
