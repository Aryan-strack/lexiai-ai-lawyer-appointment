'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { UserTable } from '@/components/dashboard/UserTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchUsers() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update user role')
    } else {
      toast.success('User role updated')
      fetchUsers()
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update user status')
    } else {
      toast.success('User status updated')
      fetchUsers()
    }
  }

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Joined'].join(','),
      ...users.map((user: any) => [
        user.name,
        user.email,
        user.role,
        user.status || 'active',
        new Date(user.created_at).toLocaleDateString(),
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage all platform users</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <UserTable 
          users={users} 
          onRoleChange={handleRoleChange}
          onStatusChange={handleStatusChange}
        />
      </div>
    </DashboardLayout>
  )
}