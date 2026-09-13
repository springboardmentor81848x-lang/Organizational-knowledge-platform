import { useMemo } from 'react'
import type { RiskSeverity } from '@/types/api'
import type { HeatmapCell, HeatmapMatrix } from '@/types/heatmap'
import styles from './PersonalGapHeatmap.module.css'

/**
 * One person's gaps as a heatmap: a tile per skill, shaded by how far short they fall.
 *
 * <p>Distinct from the team heatmap, which is a person-by-skill grid. With a single person that
 * grid collapses to one column, which wastes the width and reads worse than the table beside it.
 * Tiles let the whole skill set be scanned at once, which is the actual question here: which of
 * my skills are red.
 *
 * <p>Every value shown comes from the stored gap rows the server computed from the last
 * submitted assessment - the shade, the ordering and the counts alike. Nothing is fixed in this
 * component: answer the assessment differently and every tile moves. The one thing deliberately
 * not taken from the server is the colour itself. The backend sends a `colorCode` per cell, but
 * using it would put the palette outside the design tokens, where it could not follow dark mode
 * or the contrast rules the rest of the interface obeys, so severity is mapped to the shared
 * tokens here exactly as the team heatmap does it.
 */

const SEVERITY_ORDER: Record<RiskSeverity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

export function PersonalGapHeatmap({ matrix }: { matrix: HeatmapMatrix }) {
  /** Worst first, so the tiles that need attention are the ones read first. */
  const cells = useMemo(
    () =>
      [...matrix.matrix].sort(
        (a, b) =>
          (SEVERITY_ORDER[a.gapSeverity] ?? 9) - (SEVERITY_ORDER[b.gapSeverity] ?? 9) ||
          b.gapScore - a.gapScore ||
          a.skillName.localeCompare(b.skillName),
      ),
    [matrix.matrix],
  )

  /**
   * Counted from the cells rather than read from the server's `levelCounts`, which uses a
   * coarser three-way banding than the four severities shown on the tiles. Deriving them here
   * keeps the legend and the tiles describing the same thing.
   */
  const counts = useMemo(() => {
    const tally: Record<RiskSeverity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    for (const cell of cells) {
      if (cell.gapSeverity in tally) tally[cell.gapSeverity] += 1
    }
    return tally
  }, [cells])

  if (cells.length === 0) {
    return (
      <p className={styles.empty}>
        No skills have been analysed yet. Take the assessment for your target role and this
        heatmap will be built from the result.
      </p>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskSeverity[]).map((severity) => (
          <span key={severity} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              data-severity={severity}
              aria-hidden="true"
            />
            {SEVERITY_LABEL[severity]}
            <span className={styles.legendCount}>{counts[severity]}</span>
          </span>
        ))}
      </div>

      <ul className={styles.grid}>
        {cells.map((cell) => (
          <li key={cell.skillId}>
            <Tile cell={cell} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Tile({ cell }: { cell: HeatmapCell }) {
  const held = cell.missingSkill ? 'not on record' : cell.currentProficiencyLabel
  return (
    <div
      className={styles.tile}
      data-severity={cell.gapSeverity}
      // The full reading of the tile, so the colour is never the only carrier of the meaning -
      // for a screen reader, and for anyone who cannot separate the shades.
      title={`${cell.skillName}: holds ${held}, needs ${cell.targetProficiencyLabel}. Gap ${cell.gapScore} (${SEVERITY_LABEL[cell.gapSeverity] ?? cell.gapSeverity}).`}
    >
      <span className={styles.tileSkill}>{cell.skillName}</span>
      <span className={styles.tileGap}>{cell.gapScore}</span>
      <span className={styles.tileLevels}>
        {held} → {cell.targetProficiencyLabel}
      </span>
      <span className={styles.srOnly}>
        {SEVERITY_LABEL[cell.gapSeverity] ?? cell.gapSeverity} gap
      </span>
    </div>
  )
}
