'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { Navbar } from '@/components/shared/navbar';
import { GlassCard } from '@/components/animations';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockLeaderboard } from '@/lib/mock-data';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers this week</p>
        </motion.div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 mb-12">
          {[mockLeaderboard[1], mockLeaderboard[0], mockLeaderboard[2]].map((player, i) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`text-center ${i === 1 ? 'order-2' : i === 0 ? 'order-1' : 'order-3'}`}
            >
              <div className={`relative ${i === 1 ? 'mb-4' : 'mb-2'}`}>
                <Avatar src={player.avatar} fallback={player.name} size={i === 1 ? 'xl' : 'lg'} className={i === 1 ? 'ring-4 ring-amber-500' : ''} />
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${player.rank === 1 ? 'bg-amber-500' : player.rank === 2 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                  <span className="text-white font-bold text-sm">{player.rank}</span>
                </div>
              </div>
              <p className="font-semibold mt-4">{player.name}</p>
              <p className="text-sm text-muted-foreground">{player.xp.toLocaleString()} XP</p>
              <Badge className="mt-1">Lv.{player.level}</Badge>
            </motion.div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <GlassCard className="max-w-2xl mx-auto">
          <div className="space-y-2">
            {mockLeaderboard.map((player, i) => (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${user?.email === 'demo@ielts.com' && player.rank === 5 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}`}
              >
                <div className="w-8">{getRankIcon(player.rank)}</div>
                <Avatar src={player.avatar} fallback={player.name} size="sm" />
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">Level {player.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gradient">{player.xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
