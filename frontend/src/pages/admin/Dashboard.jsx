import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Building2, DollarSign, TrendingUp, Activity, Shield,
  UserPlus, Settings, BarChart3, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store';
import { dashboardAPI, usersAPI, tenantsAPI } from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, performanceRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getPerformanceChart(30),
        ]);
        
        setStats(statsRes.data);
        setPerformanceData(performanceRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats?.total_users || 0),
      icon: Users,
      gradient: 'from-indigo-500 to-purple-500',
      change: '+12%',
      link: '/admin/users',
    },
    {
      title: 'Active Today',
      value: stats?.active_users_today || 0,
      icon: Activity,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+5%',
    },
    {
      title: 'Total Courses',
      value: stats?.total_courses || 0,
      icon: BarChart3,
      gradient: 'from-orange-500 to-amber-500',
      change: '+8%',
    },
    {
      title: 'Exam Attempts',
      value: formatNumber(stats?.total_attempts || 0),
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-500',
      change: '+15%',
    },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899'];

  const userDistribution = [
    { name: 'Students', value: stats?.students_count || 0 },
    { name: 'Teachers', value: stats?.teachers_count || 0 },
    { name: 'Managers', value: stats?.managers_count || 0 },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-dashboard">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold font-heading">
              Admin Dashboard 🛡️
            </h1>
            <p className="text-muted-foreground mt-1">
              Platform overview and management
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/users">
              <Button variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={stat.link || '#'}>
                <div className={`stat-card bg-gradient-to-br ${stat.gradient} hover:scale-105 transition-transform cursor-pointer`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <p className="text-white/60 text-sm mt-1">{stat.change} this month</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="attempts"
                      stroke="#4F46E5"
                      fillOpacity={1}
                      fill="url(#colorAttempts)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {userDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/users">
                  <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Users</p>
                    <p className="text-sm text-muted-foreground">Manage users</p>
                  </div>
                </Link>
                <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="font-medium">Tenants</p>
                  <p className="text-sm text-muted-foreground">Manage organizations</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="font-medium">Billing</p>
                  <p className="text-sm text-muted-foreground">Revenue & subscriptions</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-muted-foreground">Audit logs</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">API Server</span>
                  </div>
                  <Badge variant="success">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">Database</span>
                  </div>
                  <Badge variant="success">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">AI Service</span>
                  </div>
                  <Badge variant="success">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Storage</span>
                  </div>
                  <Badge variant="warning">75% Used</Badge>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
