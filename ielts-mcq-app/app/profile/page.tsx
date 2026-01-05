'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { Navbar } from '@/components/shared/navbar';
import { GlassCard, ScoreRing } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockBadges, mockAchievements } from '@/lib/mock-data';
import toast from 'react-hot-toast';
import { User, Target, Flame, Star, Trophy, Calendar, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [targetBand, setTargetBand] = useState(7);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    if (user) {
      setName(user.name || '');
      setTargetBand(user.targetBand || 7);
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleSave = async () => {
    const success = await updateProfile({ name, targetBand });
    if (success) {
      toast.success('Profile updated!');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, user.level));
  const currentLevelXp = Math.floor(100 * Math.pow(1.5, user.level - 1));
  const xpProgress = ((user.xpPoints - currentLevelXp) / (xpForNextLevel - currentLevelXp)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <GlassCard className="mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar src={user.image} fallback={user.name || 'U'} size="xl" />
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    <div className="flex items-center gap-2">
                      <Label>Target Band:</Label>
                      <Input type="number" min={1} max={9} step={0.5} value={targetBand} onChange={(e) => setTargetBand(parseFloat(e.target.value))} className="w-20" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} className="gap-1"><Save className="w-4 h-4" />Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="gap-1"><X className="w-4 h-4" />Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h1 className="text-2xl font-bold">{user.name}</h1>
                      <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4" /></Button>
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                      <Badge>Level {user.level}</Badge>
                      <Badge variant="secondary">Target: Band {user.targetBand}</Badge>
                    </div>
                  </>
                )}
              </div>
              <ScoreRing score={user.targetBand || 7} isBandScore size="lg" label="Target" />
            </div>
          </GlassCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold">{user.xpPoints.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">XP Points</div>
            </GlassCard>
            <GlassCard className="text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{user.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </GlassCard>
            <GlassCard className="text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{mockBadges.length}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </GlassCard>
            <GlassCard className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm text-muted-foreground">Quizzes</div>
            </GlassCard>
          </div>

          {/* Level Progress */}
          <GlassCard className="mb-8">
            <h3 className="font-semibold mb-4">Level Progress</h3>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Lv.{user.level}</Badge>
              <Progress value={xpProgress} className="flex-1 h-3" />
              <Badge>Lv.{user.level + 1}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">{xpForNextLevel - user.xpPoints} XP needed for next level</p>
          </GlassCard>

          {/* Badges */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Badges Earned</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-2xl">{badge.icon}</div>
                  <div>
                    <p className="font-medium">{badge.name}</p>
                    <Badge variant={badge.rarity.toLowerCase() as any} className="text-xs">{badge.rarity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
