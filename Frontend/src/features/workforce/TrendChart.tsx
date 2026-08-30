import { useId, useMemo, useState } from 'react'
import styles from './TrendChart.module.css'

/**
 * A small line chart over recorded history.
 *
 * Deliberately one series per chart. The four severity colours are the app's status ramp, and
 * status colours are chosen to be legible on a labelled pill rather than to be told apart from
 * one another as bare lines: run through a colour-vision check, HIGH and MEDIUM separate by a
 * Delta E of 6 in normal vision and under 1 in protanopia, which is not enough for a reader to
 * tell two adjacent lines apart. Rather than re-pick the severity palette — it is the same scale
 * the heatmap, the pills and the reports use, and it must not drift — the severities are drawn
 * as small multiples: one panel each, sharing a y scale so they stay comparable, with the colour
 * reinforcing a label rather than carrying the identity on its own.
 *
 * The x scale is real time, so an irregular gap between snapshots shows as an irregular gap
 * rather than being evened out into a tidier-looking series than the data is.
 */

export interface TrendSeriesPoint {
  date: string
  value: number
}

const VIEW_W = 620
const VIEW_H = 190
const PAD = { top: 14, right: 52, bottom: 26, left: 36 }

export function TrendChart({
  points,
  label,
  color = 'var(--c-accent)',
  domain,
  formatValue = (value: number) => String(value),
}: {
  points: TrendSeriesPoint[]
  /** Names the series. A single-series chart needs no legend box; the title carries identity. */
  label: string
  color?: string
  /** Forced y range, for a scale with a fixed meaning such as the 0-4 proficiency scale. */
  domain?: [number, number]
  formatValue?: (value: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const clipId = useId()

  const geometry = useMemo(() => {
    const times = points.map((point) => new Date(point.date).getTime())
    const minT = Math.min(...times)
    const maxT = Math.max(...times)
    const span = maxT - minT || 1

    const values = points.map((point) => point.value)
    const [minV, maxV] = domain ?? [0, Math.max(1, ...values)]
    const range = maxV - minV || 1

    const plotW = VIEW_W - PAD.left - PAD.right
    const plotH = VIEW_H - PAD.top - PAD.bottom

    const coords = points.map((point, index) => ({
      ...point,
      index,
      x: PAD.left + ((times[index] - minT) / span) * plotW,
      y: PAD.top + plotH - ((point.value - minV) / range) * plotH,
    }))

    // Five hairlines is enough structure to read a level against without becoming a grid.
    const ticks = Array.from({ length: 5 }, (_, i) => {
      const value = minV + (range * i) / 4
      return { value, y: PAD.top + plotH - ((value - minV) / range) * plotH }
    })

    return { coords, ticks, plotW, plotH }
  }, [points, domain])

  const { coords, ticks } = geometry
  const last = coords[coords.length - 1]
  const shown = active !== null ? coords[active] : null

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>{label}</figcaption>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={`${label} over ${points.length} recorded snapshots`}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={0} width={VIEW_W - PAD.left - PAD.right} height={VIEW_H} />
          </clipPath>
        </defs>

        {ticks.map((tick) => (
          <g key={tick.value}>
            <line
              className={styles.grid}
              x1={PAD.left}
              x2={VIEW_W - PAD.right}
              y1={tick.y}
              y2={tick.y}
            />
            <text className={styles.tick} x={PAD.left - 6} y={tick.y + 3} textAnchor="end">
              {formatValue(tick.value)}
            </text>
          </g>
        ))}

        <polyline
          className={styles.line}
          clipPath={`url(#${clipId})`}
          stroke={color}
          points={coords.map((point) => `${point.x},${point.y}`).join(' ')}
        />

        {coords.map((point) => (
          <circle
            key={point.date}
            className={[styles.marker, active === point.index ? styles.markerActive : '']
              .filter(Boolean)
              .join(' ')}
            cx={point.x}
            cy={point.y}
            r={active === point.index ? 5.5 : 4.5}
            fill={color}
          />
        ))}

        {/* The endpoint is labelled directly; every other value lives in the tooltip and the
            table, so the chart never becomes a field of numbers. */}
        {last && (
          <text className={styles.endLabel} x={last.x + 9} y={last.y + 4}>
            {formatValue(last.value)}
          </text>
        )}

        {coords.map((point) => (
          <line
            key={`x-${point.date}`}
            className={styles.axisTickMark}
            x1={point.x}
            x2={point.x}
            y1={VIEW_H - PAD.bottom}
            y2={VIEW_H - PAD.bottom + 3}
          />
        ))}

        <text className={styles.tick} x={coords[0]?.x} y={VIEW_H - PAD.bottom + 15} textAnchor="start">
          {shortDate(coords[0]?.date)}
        </text>
        {coords.length > 1 && (
          <text className={styles.tick} x={last.x} y={VIEW_H - PAD.bottom + 15} textAnchor="middle">
            {shortDate(last.date)}
          </text>
        )}

        {/* Hit areas are far wider than the markers, so a value never has to be landed on. */}
        {coords.map((point, index) => {
          const half = (VIEW_W - PAD.left - PAD.right) / Math.max(1, coords.length * 2)
          return (
            <rect
              key={`hit-${point.date}`}
              className={styles.hit}
              x={point.x - half}
              y={PAD.top}
              width={half * 2}
              height={VIEW_H - PAD.top - PAD.bottom}
              tabIndex={0}
              role="button"
              aria-label={`${shortDate(point.date)}: ${formatValue(point.value)} ${label}`}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            />
          )
        })}

        {shown && (
          <line
            className={styles.crosshair}
            x1={shown.x}
            x2={shown.x}
            y1={PAD.top}
            y2={VIEW_H - PAD.bottom}
          />
        )}
      </svg>

      <p className={[styles.readout, shown ? '' : styles.readoutIdle].join(' ')} aria-live="polite">
        {shown
          ? `${shortDate(shown.date)} · ${formatValue(shown.value)}`
          : 'Hover or tab through the points to read a value.'}
      </p>
    </figure>
  )
}

function shortDate(value: string | undefined): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
