import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <Scale className="h-20 w-20 text-primary mx-auto" />
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}