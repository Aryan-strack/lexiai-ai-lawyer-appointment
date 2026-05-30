'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  CreditCard,
  Settings,
  Bell,
  Star,
  DollarSign,
  BarChart3,
  Shield,
  Scale
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  role: 'admin' | 'lawyer' | 'client'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const clientLinks = [
    { name: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
    { name: 'Appointments', href: '/dashboard/client/appointments', icon: Calendar },
    { name: 'AI Chat', href: '/dashboard/client/chat', icon: MessageSquare },
    { name: 'Documents', href: '/dashboard/client/documents', icon: FileText },
    { name: 'Favorite Lawyers', href: '/dashboard/client/favorites', icon: Star },
    { name: 'Payments', href: '/dashboard/client/payments', icon: CreditCard },
    { name: 'Notifications', href: '/dashboard/client/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/client/profile', icon: Settings },
  ]

  const lawyerLinks = [
    { name: 'Dashboard', href: '/dashboard/lawyer', icon: LayoutDashboard },
    { name: 'Appointments', href: '/dashboard/lawyer/appointments', icon: Calendar },
    { name: 'Clients', href: '/dashboard/lawyer/clients', icon: Users },
    { name: 'Earnings', href: '/dashboard/lawyer/earnings', icon: DollarSign },
    { name: 'Reviews', href: '/dashboard/lawyer/reviews', icon: Star },
    { name: 'Availability', href: '/dashboard/lawyer/availability', icon: Calendar },
    { name: 'Case Summaries', href: '/dashboard/lawyer/case-summaries', icon: FileText },
    { name: 'Settings', href: '/dashboard/lawyer/profile', icon: Settings },
  ]

  const adminLinks = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Lawyers', href: '/dashboard/admin/lawyers', icon: Scale },
    { name: 'Verification', href: '/dashboard/admin/verification', icon: Shield },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Revenue', href: '/dashboard/admin/revenue', icon: DollarSign },
    { name: 'Subscriptions', href: '/dashboard/admin/subscriptions', icon: CreditCard },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ]

  const links = role === 'admin' ? adminLinks : role === 'lawyer' ? lawyerLinks : clientLinks

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <p>LexiAI v1.0</p>
            <p>© 2024 All rights reserved</p>
          </div>
        </div>
      </div>
    </aside>
  )
}