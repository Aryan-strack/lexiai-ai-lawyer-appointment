'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function ClientProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
  })

  async function fetchProfile() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single()

    if (!error && data) {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
      })
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .update({
        name: profile.name,
        phone: profile.phone,
      })
      .eq('id', user?.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
    }
    setIsSaving(false)
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
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-4xl bg-primary text-white">
                    {profile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                JPG, GIF or PNG. Max size 2MB
              </p>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}