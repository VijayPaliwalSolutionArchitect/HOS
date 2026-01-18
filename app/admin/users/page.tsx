'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { GlassCard } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockLeaderboard } from '@/lib/mock-data';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Users, FileText, Settings, BarChart3, Search, MoreVertical, Shield, Ban, Trash2 } from 'lucide-react';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sets', label: 'Quiz Sets', icon: BookOpen },
  { href: '/admin/questions', label: 'Questions', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminUsers() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const users = mockLeaderboard.map((u, i) => ({
    ...u,
    email: `${u.name.toLowerCase().replace(' ', '.')}@example.com`,
    role: i === 0 ? 'ADMIN' : 'USER',
    status: 'active',
    joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  }));

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
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
            const isActive = link.href === '/admin/users';
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

      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Users</h1>
              <p className="text-muted-foreground">Manage user accounts</p>
            </div>
          </div>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">User</th>
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Level</th>
                    <th className="text-left p-4 font-semibold">XP</th>
                    <th className="text-left p-4 font-semibold">Joined</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.rank} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge></td>
                      <td className="p-4">{u.level}</td>
                      <td className="p-4">{u.xp.toLocaleString()}</td>
                      <td className="p-4">{u.joinedAt}</td>
                      <td className="p-4"><Badge variant="success">Active</Badge></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" title="Make Admin"><Shield className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" title="Suspend"><Ban className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></Button>
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
