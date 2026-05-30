'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Filter
} from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

interface AppointmentTableProps {
  appointments: any[]
  role: 'client' | 'lawyer'
  onStatusChange?: (id: string, status: string) => void
}

export function AppointmentTable({ appointments, role, onStatusChange }: AppointmentTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const itemsPerPage = 10

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'pending': return 'warning'
      case 'completed': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = role === 'client'
      ? apt.lawyer_name.toLowerCase().includes(searchQuery.toLowerCase())
      : apt.client_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleExport = () => {
    const csv = [
      ['Date', 'Time', 'Client/Lawyer', 'Status', 'Fee', 'Duration'].join(','),
      ...filteredAppointments.map(apt => [
        formatDate(apt.appointment_date),
        formatTime(apt.appointment_date),
        role === 'client' ? apt.lawyer_name : apt.client_name,
        apt.status,
        apt.fee,
        `${apt.duration_minutes} min`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointments_${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search by ${role === 'client' ? 'lawyer' : 'client'} name...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>{role === 'client' ? 'Lawyer' : 'Client'}</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              paginatedAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{formatDate(apt.appointment_date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(apt.appointment_date)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {role === 'client' ? apt.lawyer_name : apt.client_name}
                  </TableCell>
                  <TableCell>{apt.duration_minutes} min</TableCell>
                  <TableCell>{formatCurrency(apt.fee)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(apt.status) as any}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {apt.status === 'pending' && role === 'lawyer' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onStatusChange?.(apt.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive"
                          onClick={() => onStatusChange?.(apt.id, 'cancelled')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    {apt.status === 'confirmed' && apt.meeting_link && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={apt.meeting_link} target="_blank">Join</a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of{' '}
            {filteredAppointments.length} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}