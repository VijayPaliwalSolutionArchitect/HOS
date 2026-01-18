'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { Navbar } from '@/components/shared/navbar';
import { GlassCard, ScoreRing } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockQuizSets, mockBadges } from '@/lib/mock-data';
import Link from 'next/link';
import {
  BookOpen,
  Trophy,
  Flame,
  Target,
  Clock,
  ArrowRight,
  Star,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, user.level));
  const currentLevelXp = Math.floor(100 * Math.pow(1.5, user.level - 1));
  const xpProgress = ((user.xpPoints - currentLevelXp) / (xpForNextLevel - currentLevelXp)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground">Ready to continue your IELTS preparation?</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-2xl font-bold">{user.level}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">XP Points</p>
              <p className="text-2xl font-bold">{user.xpPoints.toLocaleString()}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
              <p className="text-2xl font-bold">{user.streak}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Band</p>
              <p className="text-2xl font-bold">{user.targetBand}</p>
            </div>
          </GlassCard>
        </div>

        {/* XP Progress */}
        <GlassCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Level Progress</h3>
              <p className="text-sm text-muted-foreground">Level {user.level} → Level {user.level + 1}</p>
            </div>
            <Badge>{xpForNextLevel - user.xpPoints} XP to next level</Badge>
          </div>
          <Progress value={xpProgress} className="h-3" />
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Featured Quizzes</h2>
              <Link href="/quiz/sets">
                <Button variant="ghost" className="gap-2">View All <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockQuizSets.filter(q => q.featured).map((quiz, i) => (
                <GlassCard key={quiz.id} hover className="cursor-pointer" onClick={() => router.push(`/quiz/${quiz.slug}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={quiz.difficulty === 'EASY' ? 'success' : quiz.difficulty === 'HARD' ? 'warning' : 'default'}>
                      {quiz.difficulty}
                    </Badge>
                    <Badge variant="secondary">{quiz.topic}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{quiz.totalQuestions} Q</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{quiz.duration} min</span>
                    <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />{quiz.avgBandScore}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Badges & Achievements */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Recent Badges</h2>
            <GlassCard>
              <div className="space-y-4">
                {mockBadges.slice(0, 4).map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-xl">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                    <Badge variant={badge.rarity.toLowerCase() as any}>{badge.rarity}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
