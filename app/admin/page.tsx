'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { GlassCard } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockQuizSets, mockLeaderboard } from '@/lib/mock-data';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, Users, FileText, Settings, BarChart3, LogOut,
  TrendingUp, Eye, Clock, Trophy, ChevronRight, Plus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sets', label: 'Quiz Sets', icon: BookOpen },
  { href: '/admin/questions', label: 'Questions', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const chartData = [
  { name: 'Mon', attempts: 120, users: 45 },
  { name: 'Tue', attempts: 180, users: 62 },
  { name: 'Wed', attempts: 150, users: 58 },
  { name: 'Thu', attempts: 220, users: 78 },
  { name: 'Fri', attempts: 280, users: 95 },
  { name: 'Sat', attempts: 320, users: 110 },
  { name: 'Sun', attempts: 250, users: 88 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const stats = [
    { label: 'Total Users', value: '12,450', change: '+12%', icon: Users, color: 'text-blue-500' },
    { label: 'Quiz Attempts', value: '45,820', change: '+8%', icon: BookOpen, color: 'text-emerald-500' },
    { label: 'Avg Score', value: '72.5%', change: '+3%', icon: TrendingUp, color: 'text-amber-500' },
    { label: 'Active Today', value: '1,240', change: '+15%', icon: Eye, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden lg:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="font-bold text-xl text-gradient">Admin</span>
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === '/admin';
            return (
              <Link key={link.href} href={link.href}>
                <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                  <Icon className="w-4 h-4" />{link.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-500" onClick={() => { signOut(); router.push('/'); }}>
            <LogOut className="w-4 h-4" />Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <Link href="/admin/sets/new">
              <Button className="gap-2"><Plus className="w-4 h-4" />Create Quiz</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <GlassCard key={i} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <Badge variant="success" className="text-xs">{stat.change}</Badge>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GlassCard>
              <h3 className="font-semibold mb-4">Weekly Attempts</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="attempts" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard>
              <h3 className="font-semibold mb-4">Active Users</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="users" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Quiz Sets</h3>
                <Link href="/admin/sets"><Button variant="ghost" size="sm">View All</Button></Link>
              </div>
              <div className="space-y-3">
                {mockQuizSets.slice(0, 4).map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium line-clamp-1">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">{quiz.totalQuestions} questions • {quiz.attemptCount} attempts</p>
                    </div>
                    <Badge variant={quiz.active ? 'success' : 'secondary'}>{quiz.active ? 'Active' : 'Draft'}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Top Performers</h3>
                <Link href="/leaderboard"><Button variant="ghost" size="sm">View All</Button></Link>
              </div>
              <div className="space-y-3">
                {mockLeaderboard.slice(0, 5).map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="w-6 text-center font-bold text-muted-foreground">{user.rank}</span>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Level {user.level}</p>
                    </div>
                    <span className="font-bold text-gradient">{user.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
