'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { GlassCard } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockQuizSets } from '@/lib/mock-data';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, Users, FileText, Settings, BarChart3, LogOut,
  Search, Plus, Edit, Trash2, Eye, MoreVertical, Copy
} from 'lucide-react';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sets', label: 'Quiz Sets', icon: BookOpen },
  { href: '/admin/questions', label: 'Questions', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminQuizSets() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin, signOut } = useAuth();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const filteredSets = mockQuizSets.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase())
  );

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
            const isActive = link.href === '/admin/sets';
            return (
              <Link key={link.href} href={link.href}>
                <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                  <Icon className="w-4 h-4" />{link.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Quiz Sets</h1>
              <p className="text-muted-foreground">Manage your quiz collections</p>
            </div>
            <Button className="gap-2"><Plus className="w-4 h-4" />Create Quiz Set</Button>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search quiz sets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          {/* Table */}
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Title</th>
                    <th className="text-left p-4 font-semibold">Topic</th>
                    <th className="text-left p-4 font-semibold">Difficulty</th>
                    <th className="text-left p-4 font-semibold">Questions</th>
                    <th className="text-left p-4 font-semibold">Attempts</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSets.map((quiz) => (
                    <tr key={quiz.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{quiz.title}</div>
                        <div className="text-xs text-muted-foreground">{quiz.slug}</div>
                      </td>
                      <td className="p-4"><Badge variant="secondary">{quiz.topic}</Badge></td>
                      <td className="p-4">
                        <Badge variant={quiz.difficulty === 'EASY' ? 'success' : quiz.difficulty === 'HARD' ? 'warning' : 'default'}>
                          {quiz.difficulty}
                        </Badge>
                      </td>
                      <td className="p-4">{quiz.totalQuestions}</td>
                      <td className="p-4">{quiz.attemptCount.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge variant={quiz.active ? 'success' : 'secondary'}>{quiz.active ? 'Active' : 'Draft'}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost"><Eye className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost"><Copy className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}
