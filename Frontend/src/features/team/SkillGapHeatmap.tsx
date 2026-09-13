import { useMemo, useState } from 'react'
import { StatusPill } from '@/components/ui/StatusPill'
import type { RiskSeverity } from '@/types/api'
import type { HeatmapCell, HeatmapMatrix } from '@/types/heatmap'
import styles from './SkillGapHeatmap.module.css'

/**
 * Skills down the side, people across the top, one cell per pair.
 *
 * The colour comes from the cell's own gapSeverity through the shared severity tokens — the
 * same four steps the gap list, the dashboards and the reports use, so a HIGH gap here is the
 * exact colour a HIGH gap is everywhere else. The backend also sends a hex colourCode per cell;
 * it is deliberately ignored, because a server choosing colours would let the palette drift out
 * of step with the rest of the interface and could not know about dark mode or contrast rules.
 *
 * A pair with no analysis has no cell, and is drawn as an empty square rather than as a zero
 * gap. "Never measured" and "measured, no gap" look nothing alike to a manager deciding where
 * to spend training budget.
 */

const SEVERITY_ORDER: Record<RiskSeverity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

export function SkillGapHeatmap({ matrix }: { matrix: HeatmapMatrix }) {
  const [selected, setSelected] = useState<HeatmapCell | null>(null)

  /** Flat cells pivoted into a lookup, so rendering a grid is not O(rows x cols x cells). */
  const byPair = useMemo(() => {
    const map = new Map<string, HeatmapCell>()
    for (const cell of matrix.matrix) map.set(`${cell.skillId}:${cell.userId}`, cell)
    return map
  }, [matrix.matrix])

  /** Worst skills first: the row order is the reading order for someone triaging. */
  const skills = useMemo(() => {
    const worst = new Map<number, number>()
    for (const cell of matrix.matrix) {
      const rank = SEVERITY_ORDER[cell.gapSeverity] ?? 9
      worst.set(cell.skillId, Math.min(worst.get(cell.skillId) ?? 9, rank))
    }
    return [...matrix.skills].sort(
      (a, b) =>
        (worst.get(a.skillId) ?? 9) - (worst.get(b.skillId) ?? 9) ||
        a.skillName.localeCompare(b.skillName),
    )
  }, [matrix.skills, matrix.matrix])

  const people = matrix.users

  if (people.length === 0 || skills.length === 0) {
    return (
      <p className={styles.empty}>
        No gap analysis has been recorded for this group yet, so there is nothing to map. Gaps are
        written when an assessment is submitted, or when analysis is run for someone.
      </p>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.grid}>
          <caption className="visually-hidden">
            Skill gaps for {matrix.scopeName}, skills by person
          </caption>
          <thead>
            <tr>
              <th className={styles.corner} scope="col">
                Skill
              </th>
              {people.map((person) => (
                <th className={styles.personHead} key={person.userId} scope="col">
                  <span className={styles.personName} title={person.userName}>
                    {person.userName}
                  </span>
                  {person.jobTitle && <span className={styles.personRole}>{person.jobTitle}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.skillId}>
                <th className={styles.skillHead} scope="row">
                  <span className={styles.skillName}>{skill.skillName}</span>
                  {skill.category && <span className={styles.skillCategory}>{skill.category}</span>}
                </th>
                {people.map((person) => {
                  const cell = byPair.get(`${skill.skillId}:${person.userId}`)
                  return (
                    <td className={styles.cellWrap} key={person.userId}>
                      <button
                        type="button"
                        className={[
                          styles.cell,
                          cell ? styles[cell.gapSeverity.toLowerCase()] : styles.absent,
                          selected === cell ? styles.cellSelected : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setSelected(cell === selected ? null : (cell ?? null))}
                        disabled={!cell}
                        title={
                          cell
                            ? `${person.userName} — ${skill.skillName}: holds ${cell.currentProficiencyLabel}, needs ${cell.targetProficiencyLabel} (gap ${cell.gapScore}, ${cell.gapSeverity})`
                            : `${person.userName} — ${skill.skillName}: not analysed`
                        }
                      >
                        <span className="visually-hidden">
                          {cell
                            ? `${person.userName}, ${skill.skillName}, ${cell.gapSeverity} gap`
                            : `${person.userName}, ${skill.skillName}, not analysed`}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <Legend />
        {selected ? <CellDetail cell={selected} matrix={matrix} /> : (
          <p className={styles.hint}>Select a cell to see current versus required level.</p>
        )}
      </div>
    </div>
  )
}

function Legend() {
  return (
    <ul className={styles.legend}>
      {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskSeverity[]).map((severity) => (
        <li className={styles.legendItem} key={severity}>
          <span className={[styles.swatch, styles[severity.toLowerCase()]].join(' ')} aria-hidden="true" />
          {severity.charAt(0) + severity.slice(1).toLowerCase()}
        </li>
      ))}
      <li className={styles.legendItem}>
        <span className={[styles.swatch, styles.absent].join(' ')} aria-hidden="true" />
        Not analysed
      </li>
    </ul>
  )
}

/**
 * What a selected cell means, including how many others share the same shortfall. The headcount
 * is what turns one person's gap into a training decision.
 */
function CellDetail({ cell, matrix }: { cell: HeatmapCell; matrix: HeatmapMatrix }) {
  const affected = matrix.matrix.filter(
    (other) => other.skillId === cell.skillId && other.gapScore > 0,
  ).length

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <span className={styles.detailTitle}>
          {cell.userName} · {cell.skillName}
        </span>
        <StatusPill value={cell.gapSeverity} />
      </div>
      <dl className={styles.detailGrid}>
        <Figure label="Holds" value={cell.currentProficiencyLabel} />
        <Figure label="Role requires" value={cell.targetProficiencyLabel} />
        <Figure label="Gap" value={String(cell.gapScore)} />
        <Figure
          label="Others with this gap"
          value={`${affected} of ${matrix.users.length}`}
        />
      </dl>
      {cell.missingSkill && (
        <p className={styles.detailNote}>
          This skill is not on {cell.userName}&rsquo;s profile at all, rather than held at a low
          level.
        </p>
      )}
    </div>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={styles.detailLabel}>{label}</dt>
      <dd className={styles.detailValue}>{value}</dd>
    </div>
  )
}
