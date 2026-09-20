"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { User, Settings2, Info, Bell, GraduationCap, ShieldAlert } from "lucide-react"

export default function SettingsPage() {
  const [showTips, setShowTips] = useState(true)
  const [notifyProgress, setNotifyProgress] = useState(true)

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto w-full p-4 md:p-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Kelola preferensi akun dan platform Anda.</p>
        </div>

        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6 md:gap-10">
          
          <div className="w-full md:w-[250px] shrink-0">
            <TabsList className="flex flex-row md:flex-col h-auto w-full bg-transparent justify-start p-0 gap-2 border-b md:border-b-0 md:border-r border-border rounded-none pb-4 md:pb-0 md:pr-4 overflow-x-auto">
              <TabsTrigger 
                value="profile" 
                className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-lg text-muted-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-lg text-muted-foreground transition-colors"
              >
                <Settings2 className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-lg text-muted-foreground transition-colors"
              >
                <Info className="h-4 w-4" />
                About Account
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-w-0">
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl font-semibold">SA</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-center h-full sm:pt-4 text-center sm:text-left">
                    <p className="text-sm text-muted-foreground mb-3">Login untuk menggunakan foto profil kustom.</p>
                    <Button variant="outline" size="sm" disabled>Ubah Foto</Button>
                  </div>
                </div>

                <div className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Tampilan</Label>
                    <Input id="name" defaultValue="SOC Analyst (Guest)" readOnly className="bg-secondary/30 text-muted-foreground focus-visible:ring-0" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input id="email" defaultValue="guest@secawareness.ai" type="email" readOnly className="bg-secondary/30 text-muted-foreground focus-visible:ring-0" />
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-orange-400 bg-orange-500/10 p-3 rounded-md border border-orange-500/20 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      Login untuk mengubah informasi profil Anda. (Fitur segera hadir)
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-0 focus-visible:outline-none">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Preferences</h2>
                  <p className="text-sm text-muted-foreground mb-6">Sesuaikan pengalaman platform edukasi Anda.</p>
                </div>
                
                <div className="space-y-6">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-secondary/10 border border-border/50">
                    <div className="space-y-1">
                      <h3 className="font-medium flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Tampilkan tips onboarding
                      </h3>
                      <p className="text-sm text-muted-foreground">Munculkan tooltips dan panduan singkat saat mencoba modul baru.</p>
                    </div>
                    <Switch 
                      checked={showTips} 
                      onCheckedChange={setShowTips} 
                    />
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-secondary/10 border border-border/50">
                    <div className="space-y-1">
                      <h3 className="font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        Notifikasi progress belajar
                      </h3>
                      <p className="text-sm text-muted-foreground">Terima notifikasi toast saat Anda menyelesaikan materi atau simulasi.</p>
                    </div>
                    <Switch 
                      checked={notifyProgress} 
                      onCheckedChange={setNotifyProgress} 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* About Account Tab */}
            <TabsContent value="account" className="mt-0 focus-visible:outline-none">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Account Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border border-border bg-secondary/20">
                    <p className="text-sm text-muted-foreground mb-1">Status Akun</p>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Guest (Offline Mode)
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-border bg-secondary/20">
                    <p className="text-sm text-muted-foreground mb-1">Bergabung sejak</p>
                    <p className="font-semibold text-foreground">
                      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-accent" />
                    Statistik Belajar
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Modul Learn selesai</span>
                        <span className="font-medium">1 / 5</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-1/5"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Akurasi Phishing Simulator</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full w-0"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </MainLayout>
  )
}
