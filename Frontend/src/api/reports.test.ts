import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { reportsApi } from './reports'
import { tokenStore } from '@/lib/tokenStore'

/**
 * What a downloaded report ends up being called.
 *
 * The name is the server's to choose, and it is the only place the file extension comes from —
 * the bytes are handed to the browser as a blob, so nothing else tells the operating system that
 * this is a PDF. Content-Disposition is not a CORS-safelisted header, which means a deployment
 * where the frontend talks to the API across origins gets `null` here unless the API exposes it,
 * with no error anywhere to say so. The old fallback saved the file as a bare "download", and a
 * file with no extension is one Windows refuses to open — which is what "the PDF download is
 * broken" turned out to mean.
 */
describe('naming a downloaded report', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  function respondWith(headers: Record<string, string>) {
    // A body of bytes, not a jsdom Blob: the Response constructor here does not accept one.
    fetchMock = vi.fn(async () => new Response('%PDF-1.4', { status: 200, headers }))
    vi.stubGlobal('fetch', fetchMock)
  }

  beforeEach(() => {
    tokenStore.set({ accessToken: 'test-token', refreshToken: 'test-refresh' })
  })

  afterEach(() => {
    tokenStore.clear()
    vi.unstubAllGlobals()
  })

  it('reads the quoted filename the server sent', async () => {
    respondWith({
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="Skill_Gap_Report.pdf"',
    })

    const { filename } = await reportsApi.skillGap('pdf')
    expect(filename).toBe('Skill_Gap_Report.pdf')
  })

  it('still reads an unquoted filename, which is what older clients sent', async () => {
    respondWith({
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename=Skill_Gap_Report.pdf',
    })

    const { filename } = await reportsApi.skillGap('pdf')
    expect(filename).toBe('Skill_Gap_Report.pdf')
  })

  it('prefers the UTF-8 filename* so a non-ASCII name survives', async () => {
    respondWith({
      'content-type': 'application/pdf',
      'content-disposition':
        "attachment; filename=\"Department_Training_Report_Ingenier_a.pdf\"; " +
        "filename*=UTF-8''Department_Training_Report_Ingenier%C3%ADa.pdf",
    })

    const { filename } = await reportsApi.departmentTraining('Ingeniería', 'pdf')
    expect(filename).toBe('Department_Training_Report_Ingeniería.pdf')
  })

  it('keeps the extension when the header never reaches the browser', async () => {
    respondWith({ 'content-type': 'application/pdf' })

    const { filename } = await reportsApi.skillGap('pdf')
    expect(filename).toMatch(/\.pdf$/)
    expect(filename).not.toBe('download')
  })

  it('names a spreadsheet .xlsx rather than guessing at PDF', async () => {
    respondWith({
      'content-type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const { filename } = await reportsApi.employeeLearning(7, 'excel')
    expect(filename).toMatch(/\.xlsx$/)
  })
})
