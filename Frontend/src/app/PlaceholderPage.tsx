import { Card } from '@/components/ui/Card'
import { EmptyBlock } from '@/components/ui/AsyncState'

/**
 * Stands in for a screen that has not been built yet.
 *
 * It shows nothing and asks the API for nothing. The alternative — a layout filled with
 * plausible sample figures — is the thing most likely to end up in a demo and be mistaken
 * for real data.
 */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card>
      <EmptyBlock
        title={`${title} is not built yet`}
        message="This screen will be added in a later part. Nothing is shown here because there is no real data to show yet."
      />
    </Card>
  )
}
