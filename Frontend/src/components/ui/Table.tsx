import type { ReactNode } from 'react'
import { EmptyBlock, ErrorBlock, LoadingBlock } from './AsyncState'
import { isPermissionDenied, PermissionDenied } from './PermissionDenied'
import styles from './Table.module.css'

export interface Column<T> {
  key: string
  header: ReactNode
  /** Rendered per row. Kept as a function so a cell can be a badge or a link, not just text. */
  render: (row: T) => ReactNode
  /** Right-aligns and applies tabular figures, for anything compared down a column. */
  numeric?: boolean
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void

  /** Wired straight to the query, so the table owns its own async states. */
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void

  emptyTitle?: string
  emptyMessage?: ReactNode
  caption?: string
}

/**
 * A data table that renders its own loading, error, permission-denied and empty states.
 *
 * Putting them here rather than around every call site is what stops a screen from quietly
 * rendering an empty table when the request actually failed — an empty table and a failed
 * request look identical to a reader otherwise.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = 'Nothing to show',
  emptyMessage,
  caption,
}: TableProps<T>) {
  const state = (content: ReactNode) => (
    <tr>
      <td className={styles.stateCell} colSpan={columns.length}>
        {content}
      </td>
    </tr>
  )

  function body() {
    if (isLoading) return state(<LoadingBlock rows={4} label="Loading table" />)
    if (error) {
      return state(
        isPermissionDenied(error) ? <PermissionDenied /> : <ErrorBlock error={error} onRetry={onRetry} />,
      )
    }
    if (!rows || rows.length === 0) {
      return state(<EmptyBlock title={emptyTitle} message={emptyMessage} />)
    }

    return rows.map((row) => (
      <tr
        key={rowKey(row)}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={
          onRowClick
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onRowClick(row)
                }
              }
            : undefined
        }
      >
        {columns.map((column) => (
          <td key={column.key} className={column.numeric ? styles.numeric : undefined}>
            {column.render(row)}
          </td>
        ))}
      </tr>
    ))
  }

  return (
    <div className={styles.wrapper}>
      <table className={[styles.table, onRowClick ? styles.clickable : ''].filter(Boolean).join(' ')}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.numeric ? styles.numeric : undefined}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{body()}</tbody>
      </table>
    </div>
  )
}
