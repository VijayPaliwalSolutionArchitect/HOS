import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, LayoutDashboard, BookOpen, FileText, Trophy,
  User, Settings, LogOut, ChevronLeft, ChevronRight, Bell,
  Users, BarChart3, HelpCircle, Layers
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuthStore, useUIStore } from '../store';
import { cn, getInitials } from '../lib/utils';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = {
      STUDENT: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
        { icon: FileText, label: 'Exams', path: '/student/exams' },
        { icon: BookOpen, label: 'Courses', path: '/student/courses' },
        { icon: Trophy, label: 'Results', path: '/student/results' },
        { icon: User, label: 'Profile', path: '/student/profile' },
      ],
      TEACHER: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
        { icon: Layers, label: 'Question Bank', path: '/manager/questions' },
        { icon: FileText, label: 'Exams', path: '/manager/exams' },
        { icon: BookOpen, label: 'Courses', path: '/manager/courses' },
        { icon: BarChart3, label: 'Reports', path: '/manager/reports' },
      ],
      MANAGER: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
        { icon: Layers, label: 'Question Bank', path: '/manager/questions' },
        { icon: FileText, label: 'Exams', path: '/manager/exams' },
        { icon: BookOpen, label: 'Courses', path: '/manager/courses' },
        { icon: Users, label: 'Students', path: '/manager/students' },
        { icon: BarChart3, label: 'Analytics', path: '/manager/analytics' },
      ],
      ADMIN: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Layers, label: 'Tenants', path: '/admin/tenants' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
      ],
    };

    return baseItems[user?.role] || baseItems.STUDENT;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="fixed left-0 top-0 h-screen bg-card border-r border-border z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">EduExam Pro</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'sidebar-link',
                  isActive && 'active'
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-muted/50",
            !sidebarOpen && "justify-center"
          )}>
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.role}</div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn("w-full mt-2 justify-start gap-3", !sidebarOpen && "justify-center")}
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "ml-[260px]" : "ml-20"
      )}>
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
