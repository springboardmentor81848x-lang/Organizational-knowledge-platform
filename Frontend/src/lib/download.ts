/**
 * Hands a file the server generated to the browser to save.
 *
 * The bytes come from the backend's report endpoints, which build the document from live
 * queries at request time. Nothing here draws or prints the page: a report is a document
 * generated from the data, not a picture of a screen, so it holds figures the screen never
 * showed and stays readable when the screen changes.
 */
export function saveFile({ blob, filename }: { blob: Blob; filename: string }): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoked on the next tick: revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
