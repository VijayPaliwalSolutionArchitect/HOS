'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Trophy,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Flame,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/quiz/sets', label: 'Practice', icon: BookOpen },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="font-bold text-xl text-gradient hidden sm:block">IELTS MCQ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} className="gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {isAuthenticated ? (
              <>
                {/* Streak */}
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600">{user?.streak || 0}</span>
                </div>

                {/* XP */}
                <Badge variant="default" className="hidden sm:flex">
                  {user?.xpPoints || 0} XP
                </Badge>

                {/* Profile dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <Avatar src={user?.image} fallback={user?.name || 'U'} size="sm" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 glass-card rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <hr className="my-2 border-border" />
                    <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 w-full text-red-500">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
                <Link href="/register"><Button>Get Started</Button></Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden border-t bg-background"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {isAuthenticated && navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export default Navbar;
