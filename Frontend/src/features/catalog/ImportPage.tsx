import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '@/api/catalog'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import type { CatalogImportResult, ImportRowError } from '@/types/admin'
import styles from './Catalog.module.css'

/**
 * Bringing external courses into the catalogue.
 *
 * The result panel is the point of this screen. The server reports what it actually did — rows
 * read, created, updated, and every row it rejected with the line number and the reason — and
 * that is reported here verbatim. Nothing infers success from the request having returned; an
 * import of forty rows that created thirty-eight says so, and names the two it did not.
 *
 * Created and updated are kept apart because re-importing a file is normal and looks identical
 * to importing new material unless the distinction is drawn.
 */

const PROVIDERS = [{ name: 'Coursera', note: 'Live fetch from the public Coursera catalogue' }]

export function ImportPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [providerName, setProviderName] = useState(PROVIDERS[0].name)
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState<CatalogImportResult | null>(null)

  function absorb(imported: CatalogImportResult) {
    setResult(imported)
    // Imported courses are ordinary catalogue courses: they can be enrolled in and they enter
    // learning paths for anyone with a gap in the skill they cover.
    queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all })
  }

  const importFile = useMutation({
    mutationFn: (chosen: File) => catalogApi.importFile(chosen),
    onError: (error) => toast.fromError('The file could not be imported', error),
    onSuccess: (imported) => {
      absorb(imported)
      setFile(null)
      if (fileInput.current) fileInput.current.value = ''
      summarise(toast, imported)
    },
  })

  const importProvider = useMutation({
    mutationFn: () => catalogApi.importFromProvider(providerName, keyword.trim()),
    onError: (error) => toast.fromError('The provider could not be reached', error),
    onSuccess: (imported) => {
      absorb(imported)
      summarise(toast, imported)
    },
  })

  const busy = importFile.isPending || importProvider.isPending

  return (
    <>
      <Card
        title="Import a curated file"
        description="A CSV or JSON list of external courses — Infosys Springboard, Coursera, Udemy or any other."
      >
        <div className={styles.controlRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>File</span>
            <input
              ref={fileInput}
              className={styles.input}
              type="file"
              accept=".csv,.json,.txt"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <span className={styles.fieldHint}>
              CSV columns: title, provider, skill, difficulty, duration, url, description. A row
              without a title cannot become a course and will be reported as rejected.
            </span>
          </label>

          <Button
            variant="primary"
            disabled={!file || busy}
            loading={importFile.isPending}
            onClick={() => file && importFile.mutate(file)}
          >
            Import file
          </Button>
        </div>
      </Card>

      <Card
        title="Fetch from a provider"
        description="Calls the provider live and folds whatever it returns into the catalogue."
      >
        <div className={styles.controlRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Provider</span>
            <select
              className={styles.select}
              value={providerName}
              onChange={(event) => setProviderName(event.target.value)}
            >
              {PROVIDERS.map((provider) => (
                <option key={provider.name} value={provider.name}>
                  {provider.name}
                </option>
              ))}
            </select>
            <span className={styles.fieldHint}>
              {PROVIDERS.find((provider) => provider.name === providerName)?.note}
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Narrow to</span>
            <input
              className={styles.input}
              value={keyword}
              placeholder="java, cloud, leadership…"
              onChange={(event) => setKeyword(event.target.value)}
            />
          </label>

          <Button
            disabled={busy}
            loading={importProvider.isPending}
            onClick={() => importProvider.mutate()}
          >
            Fetch and import
          </Button>
        </div>
      </Card>

      {result && <ImportResult result={result} />}
    </>
  )
}

function ImportResult({ result }: { result: CatalogImportResult }) {
  const errorColumns: Column<ImportRowError>[] = [
    {
      key: 'line',
      header: result.fromProvider ? 'Entry' : 'Line',
      width: '80px',
      numeric: true,
      render: (row) => (row.line == null ? '—' : String(row.line)),
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => row.title ?? <span className={styles.muted}>No title</span>,
    },
    { key: 'reason', header: 'Why it was rejected', render: (row) => row.reason },
  ]

  return (
    <Card
      title={`Import result — ${result.source}`}
      description={
        result.fromProvider
          ? 'A live provider fetch.'
          : 'Every row in the file is accounted for below.'
      }
      flush={result.skipped > 0}
    >
      {result.providerError ? (
        <div className={styles.failureNote} role="alert">
          <strong>The provider could not be reached.</strong> {result.providerError} The catalogue
          is unchanged. This is a fault to retry, not a provider that had nothing to offer.
        </div>
      ) : (
        <>
          <dl className={styles.stats}>
            <Stat label="Rows read" value={result.rowsRead} />
            <Stat label="Created" value={result.created} tone={result.created > 0 ? 'good' : undefined} />
            <Stat label="Updated" value={result.updated} />
            <Stat
              label="Rejected"
              value={result.skipped}
              tone={result.skipped > 0 ? 'bad' : undefined}
            />
          </dl>

          <p className={styles.resultLine}>
            {result.rowsRead === 0
              ? result.fromProvider
                ? 'The provider answered, and had no courses matching that keyword. Nothing was changed.'
                : 'The file held no rows. Nothing was changed.'
              : result.skipped === 0
                ? `All ${result.rowsRead} rows imported. ${result.created} new, ${result.updated} already in the catalogue and refreshed.`
                : `${result.created + result.updated} of ${result.rowsRead} rows imported; ${result.skipped} rejected.`}
          </p>
        </>
      )}

      {result.skipped > 0 && (
        <Table
          columns={errorColumns}
          rows={result.errors}
          rowKey={(row, ) => `${row.line ?? 'x'}-${row.reason}`}
          caption="Rejected rows"
        />
      )}
    </Card>
  )
}

function summarise(
  toast: { success: (title: string, message?: string) => void },
  result: CatalogImportResult,
): void {
  if (result.providerError) {
    toast.success('Import did not run', result.providerError)
    return
  }
  toast.success(
    `${result.created} created, ${result.updated} updated`,
    result.skipped > 0 ? `${result.skipped} row(s) rejected — see the result below.` : undefined,
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'good' | 'bad'
}) {
  return (
    <div>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={[styles.statValue, tone ? styles[tone] : ''].filter(Boolean).join(' ')}>
        <span className="tabular">{value}</span>
      </dd>
    </div>
  )
}
