import { PROFICIENCY_SCORE, type ProficiencyLevel } from '@/types/api'
import styles from './ProficiencyScale.module.css'

const ORDER: ProficiencyLevel[] = ['UNAWARE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

const LABEL: Record<ProficiencyLevel, string> = {
  UNAWARE: 'Unaware',
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

export const PROFICIENCY_LEVELS = ORDER
export const proficiencyLabel = (level: ProficiencyLevel) => LABEL[level]

/**
 * A proficiency level shown as a position on a five-step ladder.
 *
 * The number alone is meaningless to a reader — "2" says nothing about whether that is good.
 * Filled segments show how far along the scale somebody is and how far is left, and the word
 * is always present so the meaning never rests on the graphic.
 */
export function ProficiencyScale({
  level,
  compact = false,
  showLabel = true,
}: {
  level: ProficiencyLevel
  compact?: boolean
  showLabel?: boolean
}) {
  const score = PROFICIENCY_SCORE[level]

  return (
    <span className={[styles.scale, compact ? styles.compact : ''].filter(Boolean).join(' ')}>
      <span className={styles.track} aria-hidden="true">
        {ORDER.map((_, index) => (
          <span
            key={index}
            className={[
              styles.segment,
              index <= score ? styles.filled : '',
              level === 'UNAWARE' && index === 0 ? styles.unaware : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </span>
      {showLabel && <span className={styles.label}>{LABEL[level]}</span>}
      <span className="visually-hidden">
        {LABEL[level]}, level {score} of {ORDER.length - 1}
      </span>
    </span>
  )
}
