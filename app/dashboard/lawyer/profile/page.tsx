'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

const SPECIALIZATIONS = [
  'Corporate Law', 'Criminal Law', 'Family Law', 'Property Law', 
  'Civil Rights', 'Immigration Law', 'Tax Law', 'Intellectual Property',
  'Labor Law', 'Contract Law', 'Real Estate', 'Banking Law'
]

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']

export default function LawyerProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<{ specialization: string[], experience_years: number, bar_council_number: string, city: string, fee_per_hour: number, bio: string, languages: string[], education: string[] }>({
    specialization: [],
    experience_years: 0,
    bar_council_number: '',
    city: '',
    fee_per_hour: 0,
    bio: '',
    languages: ['English'],
    education: [],
  })

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('lawyers')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (!error && data) {
          setProfile({
            specialization: data.specialization || [],
            experience_years: data.experience_years || 0,
            bar_council_number: data.bar_council_number || '',
            city: data.city || '',
            fee_per_hour: data.fee_per_hour || 0,
            bio: data.bio || '',
            languages: data.languages || ['English'],
            education: data.education || [],
          })
        }
        setIsLoading(false)
      }

      fetchProfile()
    }
  }, [user])

  const addSpecialization = (spec: string) => {
    if (!profile.specialization.includes(spec)) {
      setProfile({ ...profile, specialization: [...profile.specialization, spec] })
    }
  }

  const removeSpecialization = (spec: string) => {
    setProfile({ ...profile, specialization: profile.specialization.filter(s => s !== spec) })
  }

  const addLanguage = () => {
    setProfile({ ...profile, languages: [...profile.languages, ''] })
  }

  const updateLanguage = (index: number, value: string) => {
    const newLanguages = [...profile.languages]
    newLanguages[index] = value
    setProfile({ ...profile, languages: newLanguages })
  }

  const removeLanguage = (index: number) => {
    setProfile({ ...profile, languages: profile.languages.filter((_, i) => i !== index) })
  }

  const addEducation = () => {
    setProfile({ ...profile, education: [...profile.education, ''] })
  }

  const updateEducation = (index: number, value: string) => {
    const newEducation = [...profile.education]
    newEducation[index] = value
    setProfile({ ...profile, education: newEducation })
  }

  const removeEducation = (index: number) => {
    setProfile({ ...profile, education: profile.education.filter((_, i) => i !== index) })
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()
    
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    const { error } = await supabase
      .from('lawyers')
      .update({
        specialization: profile.specialization,
        experience_years: profile.experience_years,
        bar_council_number: profile.bar_council_number,
        city: profile.city,
        fee_per_hour: profile.fee_per_hour,
        bio: profile.bio,
        languages: profile.languages,
        education: profile.education,
      })
      .eq('id', lawyer.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <DashboardLayout role="lawyer">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="lawyer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your professional profile</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Your legal credentials and practice areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Specialization *</Label>
                  <Select onValueChange={addSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.filter(s => !profile.specialization.includes(s)).map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.specialization.map(spec => (
                      <Badge key={spec} variant="secondary" className="gap-1">
                        {spec}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSpecialization(spec)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    value={profile.experience_years}
                    onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bar Council Number</Label>
                  <Input
                    value={profile.bar_council_number}
                    onChange={(e) => setProfile({ ...profile, bar_council_number: e.target.value })}
                    placeholder="e.g., 12345/HC/2020"
                  />
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={profile.city} onValueChange={(value) => setProfile({ ...profile, city: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fee per Hour (USD)</Label>
                  <Input
                    type="number"
                    value={profile.fee_per_hour}
                    onChange={(e) => setProfile({ ...profile, fee_per_hour: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell clients about your experience and approach..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Languages you speak</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.languages.map((lang, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={lang}
                      onChange={(e) => updateLanguage(index, e.target.value)}
                      placeholder="e.g., English, Urdu"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeLanguage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLanguage} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>Your educational background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.education.map((edu, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={edu}
                      onChange={(e) => updateEducation(index, e.target.value)}
                      placeholder="e.g., LL.B from Punjab University"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeEducation(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addEducation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}