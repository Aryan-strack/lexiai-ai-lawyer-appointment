import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from './RatingStars'
import { formatDistanceToNow } from 'date-fns'

interface ReviewProps {
  review: {
    id: string
    rating: number
    review_text: string
    created_at: string
    lawyer_response?: string
    client?: {
      name: string
      avatar_url?: string
    }
  }
}

export function ReviewCard({ review }: ReviewProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.client?.avatar_url || ''} alt={review.client?.name || 'Client'} />
            <AvatarFallback>{review.client?.name?.charAt(0) || 'C'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{review.client?.name || 'Anonymous Client'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <RatingStars rating={review.rating} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mt-2">{review.review_text}</p>
        
        {review.lawyer_response && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md border-l-2 border-primary">
            <p className="text-xs font-semibold mb-1">Lawyer's Response:</p>
            <p className="text-sm text-muted-foreground">{review.lawyer_response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
