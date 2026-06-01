'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Check, X, Eye, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function AdminLawyersPage() {
  const [lawyers, setLawyers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchLawyers() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lawyers')
      .select(`
        *,
        users:user_id (
          name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLawyers(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchLawyers()
  }, [])

  const verifyLawyer = async (lawyerId: string, verify: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('lawyers')
      .update({ 
        verified: verify,
        verified_at: verify ? new Date().toISOString() : null 
      })
      .eq('id', lawyerId)

    if (error) {
      toast.error('Failed to update lawyer status')
    } else {
      toast.success(verify ? 'Lawyer verified' : 'Verification removed')
      fetchLawyers()
    }
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
        <div>
          <h1 className="text-3xl font-bold">Lawyer Management</h1>
          <p className="text-muted-foreground mt-1">Verify and manage lawyers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Lawyers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lawyer</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lawyers.map((lawyer: any) => (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {lawyer.users.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{lawyer.users.name}</p>
                          <p className="text-sm text-muted-foreground">{lawyer.users.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specialization?.slice(0, 2).map((spec: string) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{lawyer.experience_years} years</TableCell>
                    <TableCell>${lawyer.fee_per_hour}/hr</TableCell>
                    <TableCell>
                      <Badge variant={lawyer.verified ? 'success' : 'warning'}>
                        {lawyer.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/lawyers/${lawyer.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!lawyer.verified ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-500"
                            onClick={() => verifyLawyer(lawyer.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => verifyLawyer(lawyer.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}