import { Star, StarHalf } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  maxStars?: number
  className?: string
  starClassName?: string
}

export function RatingStars({
  rating,
  maxStars = 5,
  className = "flex items-center gap-0.5",
  starClassName = "h-4 w-4"
}: RatingStarsProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={className}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={`${starClassName} fill-yellow-400 text-yellow-400`} />
      ))}
      {hasHalfStar && (
        <StarHalf key="half" className={`${starClassName} fill-yellow-400 text-yellow-400`} />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${starClassName} text-muted-foreground`} />
      ))}
    </div>
  )
}
