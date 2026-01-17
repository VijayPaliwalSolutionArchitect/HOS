import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, FileText, HelpCircle, BookOpen, TrendingUp, BarChart3,
  PlusCircle, Brain, Target, Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store';
import { dashboardAPI, questionsAPI, examsAPI } from '../../lib/api';
import { formatNumber, formatDate } from '../../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, performanceRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentActivity(10),
          dashboardAPI.getPerformanceChart(30),
        ]);
        
        setStats(statsRes.data);
        setRecentActivity(activityRes.data || []);
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
      title: 'Total Questions',
      value: formatNumber(stats?.total_questions || 0),
      icon: HelpCircle,
      gradient: 'from-indigo-500 to-purple-500',
      link: '/manager/questions',
    },
    {
      title: 'Active Exams',
      value: stats?.total_exams || 0,
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-500',
      link: '/manager/exams',
    },
    {
      title: 'Total Students',
      value: formatNumber(stats?.students_count || 0),
      icon: Users,
      gradient: 'from-orange-500 to-amber-500',
      link: '/manager/students',
    },
    {
      title: 'Pass Rate',
      value: `${Math.round(stats?.pass_rate || 0)}%`,
      icon: Target,
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899'];

  const pieData = [
    { name: 'Passed', value: Math.round(stats?.pass_rate || 0) },
    { name: 'Failed', value: 100 - Math.round(stats?.pass_rate || 0) },
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
      <div className="space-y-8" data-testid="manager-dashboard">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold font-heading">
              Welcome, {user?.name?.split(' ')[0]}! 📊
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your examination system
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/manager/questions">
              <Button variant="outline" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Question
              </Button>
            </Link>
            <Link to="/manager/exams">
              <Button className="gap-2" data-testid="create-exam-btn">
                <FileText className="w-4 h-4" />
                Create Exam
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
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="attempts" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="average_score" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Pass Rate Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4">Pass Rate</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Failed</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Actions & Recent Activity */}
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
                <Link to="/manager/questions">
                  <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Question Bank</p>
                    <p className="text-sm text-muted-foreground">Manage questions</p>
                  </div>
                </Link>
                <Link to="/manager/exams">
                  <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="font-medium">Exams</p>
                    <p className="text-sm text-muted-foreground">Create & manage</p>
                  </div>
                </Link>
                <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium">AI Generator</p>
                  <p className="text-sm text-muted-foreground">Generate questions</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-muted-foreground">View reports</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.passed ? 'bg-green-500/10' : 'bg-yellow-500/10'
                      }`}>
                        {activity.passed ? (
                          <Target className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.user_name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.exam_title}
                        </p>
                      </div>
                      <Badge variant={activity.passed ? 'success' : 'warning'}>
                        {activity.score ? `${activity.score}%` : 'In Progress'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
