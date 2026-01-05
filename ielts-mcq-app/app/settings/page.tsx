'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { Navbar } from '@/components/shared/navbar';
import { GlassCard } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import toast from 'react-hot-toast';
import { Settings, Bell, Volume2, Trash2, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut, updateProfile } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    toast.success('Signed out successfully');
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Appearance */}
            <GlassCard>
              <h3 className="font-semibold mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Select your preferred theme</p>
                </div>
                <ThemeToggle />
              </div>
            </GlassCard>

            {/* Notifications */}
            <GlassCard>
              <h3 className="font-semibold mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified about streaks and achievements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-sm text-muted-foreground">Play sounds for correct/incorrect answers</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSound(!sound)}
                    className={`w-12 h-6 rounded-full transition-colors ${sound ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${sound ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Account */}
            <GlassCard>
              <h3 className="font-semibold mb-4">Account</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />Sign Out
                </Button>
                <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => toast.error('Account deletion is disabled in demo')}>
                  <Trash2 className="w-4 h-4" />Delete Account
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
