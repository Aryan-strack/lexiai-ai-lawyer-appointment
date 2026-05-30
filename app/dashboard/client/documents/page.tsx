'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Trash2, FileText, Eye } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function ClientDocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDocuments(data)
    }
    setIsLoading(false)
  }

  const handleDelete = async (documentId: string, fileUrl: string) => {
    const supabase = createClient()
    
    // Delete from storage
    const filePath = fileUrl.split('/').pop()
    await supabase.storage.from('documents').remove([filePath])
    
    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      toast.error('Failed to delete document')
    } else {
      toast.success('Document deleted')
      fetchDocuments()
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'legal_document': return '📄'
      case 'id_proof': return '🪪'
      case 'case_file': return '⚖️'
      default: return '📁'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="client">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Documents</h1>
            <p className="text-muted-foreground mt-1">Upload and manage your legal documents</p>
          </div>
          <Link href="/dashboard/client/documents/upload">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first legal document</p>
                <Link href="/dashboard/client/documents/upload">
                  <Button>Upload Document</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getDocumentIcon(doc.document_type)}</span>
                          {doc.file_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {doc.document_type?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{(doc.file_size / 1024).toFixed(2)} KB</TableCell>
                      <TableCell>{formatDate(doc.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.file_url} download={doc.file_name}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => handleDelete(doc.id, doc.file_url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}