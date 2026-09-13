import { useQuery } from '@tanstack/react-query'
import { recommendationsApi } from '@/api/recommendations'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { StatusPill } from '@/components/ui/StatusPill'
import type { TrainingRecommendation } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import styles from './LearningPage.module.css'

/**
 * Recommendations, ranked as the server ranked them.
 *
 * The relevance score and the breakdown behind it are both shown. A ranked list without its
 * reasoning asks the reader to take the order on faith; the breakdown names the factors — gap
 * severity, role relevance, how well the course level fits — so somebody can disagree with it
 * knowingly.
 */
export function RecommendationsPage() {
  const { user } = useSession()
  const employeeId = user?.id

  const query = useQuery({
    queryKey: queryKeys.recommendations.forUser(employeeId!),
    queryFn: ({ signal }) => recommendationsApi.forEmployee(employeeId!, signal),
    enabled: Boolean(employeeId),
  })

  // Priority rank is the server's ordering; relevance breaks ties within it.
  const ranked = query.data
    ? [...query.data].sort(
        (a, b) => a.priorityRank - b.priorityRank || b.relevanceScore - a.relevanceScore,
      )
    : undefined

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recommended for you</h1>
        <p className={styles.subtitle}>
          Generated from your current gaps and regenerated whenever they change, so this list
          follows your assessments rather than sitting still.
        </p>
      </header>

      <Card flush={query.isLoading || Boolean(query.error) || ranked?.length === 0}>
        {query.isLoading ? (
          <LoadingBlock rows={4} label="Loading recommendations" />
        ) : query.isError ? (
          isPermissionDenied(query.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={query.error} onRetry={query.refetch} />
          )
        ) : !ranked || ranked.length === 0 ? (
          <EmptyBlock
            title="Nothing recommended yet"
            message="Recommendations appear once your gaps have been analysed. Submitting an assessment will produce them."
          />
        ) : (
          <ol className={styles.steps}>
            {ranked.map((recommendation, index) => (
              <RecommendationRow key={recommendation.id} rank={index + 1} item={recommendation} />
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}

function RecommendationRow({ rank, item }: { rank: number; item: TrainingRecommendation }) {
  return (
    <li className={styles.step}>
      <span className={styles.stepNumber} aria-hidden="true">
        {rank}
      </span>
      <div className={styles.stepBody}>
        <div className={styles.stepHead}>
          <span className={styles.stepTitle}>{item.skillName}</span>
          <StatusPill value={item.sourceGapSeverity} />
        </div>
        <p className={styles.stepDesc}>{item.recommendationText}</p>
        <p className={styles.stepMeta}>Suggested format: {item.suggestedResourceType}</p>

        <div className={styles.scoreRow}>
          <div className={styles.scoreBar} aria-hidden="true">
            <div
              className={styles.scoreFill}
              style={{ width: `${Math.min(100, Math.max(0, item.relevanceScore))}%` }}
            />
          </div>
          <span className={styles.scoreValue}>Relevance {item.relevanceScore} / 100</span>
        </div>

        {item.scoreBreakdown && <p className={styles.breakdown}>{item.scoreBreakdown}</p>}
      </div>
    </li>
  )
}
