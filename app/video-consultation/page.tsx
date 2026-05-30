'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Mic, MicOff, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react'

export default function VideoConsultationPage() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isAudioOff, setIsAudioOff] = useState(false)

  // Mock video meeting - in production, integrate with Zoom/Google Meet API
  useEffect(() => {
    if (!roomId) {
      // Redirect or show error
    }
  }, [roomId])

  const handleEndCall = () => {
    window.close()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-4rem)]">
          {/* Main Video */}
          <div className="lg:col-span-3">
            <Card className="h-full bg-gray-800">
              <CardContent className="p-0 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-64 h-64 rounded-full bg-gray-700 mx-auto flex items-center justify-center">
                    <Video className="h-16 w-16 text-gray-500" />
                  </div>
                  <p className="text-white mt-4">Connecting to video call...</p>
                  <p className="text-sm text-gray-400 mt-2">Room ID: {roomId}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Participants */}
          <div className="space-y-6">
            <Card className="bg-gray-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Controls</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isVideoOff ? "destructive" : "secondary"}
                    onClick={() => setIsVideoOff(!isVideoOff)}
                  >
                    {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isAudioOff ? "destructive" : "secondary"}
                    onClick={() => setIsAudioOff(!isAudioOff)}
                  >
                    {isAudioOff ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" onClick={handleEndCall}>
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Participants</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">JD</span>
                    </div>
                    <div>
                      <p className="text-white text-sm">John Doe (You)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-500 text-sm">SA</span>
                    </div>
                    <div>
                      <p className="text-white text-sm">Sarah Ahmed (Lawyer)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}