import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, FileText, Trophy, Target, Zap, TrendingUp,
  Clock, CheckCircle2, ArrowRight, Star
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, GlassCard } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store';
import { dashboardAPI, examsAPI, attemptsAPI } from '../../lib/api';
import { formatDate, formatNumber, getDifficultyColor } from '../../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, examsRes, attemptsRes, performanceRes] = await Promise.all([
          dashboardAPI.getStats(),
          examsAPI.getAll({ limit: 5 }),
          attemptsAPI.getAll({ limit: 5 }),
          dashboardAPI.getPerformanceChart(30),
        ]);
        
        setStats(statsRes.data);
        setExams(examsRes.data.exams || []);
        setRecentAttempts(attemptsRes.data.attempts || []);
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
      title: 'XP Points',
      value: formatNumber(stats?.my_xp_points || user?.xp_points || 0),
      icon: Zap,
      gradient: 'from-indigo-500 to-purple-500',
      subtitle: `Level ${stats?.my_level || user?.level || 1}`,
    },
    {
      title: 'Exams Taken',
      value: stats?.my_exams_taken || 0,
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-500',
      subtitle: 'Total attempts',
    },
    {
      title: 'Average Score',
      value: `${Math.round(stats?.my_average_score || 0)}%`,
      icon: Target,
      gradient: 'from-orange-500 to-amber-500',
      subtitle: 'Performance',
    },
    {
      title: 'Pass Rate',
      value: `${Math.round(stats?.my_pass_rate || 0)}%`,
      icon: Trophy,
      gradient: 'from-pink-500 to-rose-500',
      subtitle: `${stats?.my_streak || user?.streak || 0} day streak`,
    },
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
      <div className="space-y-8" data-testid="student-dashboard">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold font-heading">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to continue your learning journey?
            </p>
          </div>
          <Link to="/student/exams">
            <Button className="gap-2" data-testid="take-exam-btn">
              <FileText className="w-4 h-4" />
              Take Exam
            </Button>
          </Link>
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
              <div className={`stat-card bg-gradient-to-br ${stat.gradient}`} data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-white/60 text-sm mt-1">{stat.subtitle}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="average_score"
                      stroke="#4F46E5"
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Level Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-3">
                    <span className="text-3xl font-bold text-white">
                      {stats?.my_level || user?.level || 1}
                    </span>
                  </div>
                  <p className="font-medium">Level {stats?.my_level || user?.level || 1}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(user?.xp_points || 0)} XP
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to next level</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{user?.streak || 0} day streak</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Available Exams & Recent Attempts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Exams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Available Exams</h3>
                <Link to="/student/exams" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {exams.length > 0 ? (
                  exams.slice(0, 4).map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {exam.duration_minutes} min
                            <span>•</span>
                            {exam.question_count} questions
                          </div>
                        </div>
                      </div>
                      <Link to={`/student/exam/${exam.id}`}>
                        <Button size="sm" variant="outline" data-testid={`start-exam-${exam.id}`}>
                          Start
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No exams available yet
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Attempts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Results</h3>
                <Link to="/student/results" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentAttempts.length > 0 ? (
                  recentAttempts.slice(0, 4).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          attempt.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {attempt.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Target className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{attempt.exam_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(attempt.started_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${attempt.passed ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.round(attempt.percentage)}%
                        </p>
                        <Badge variant={attempt.passed ? 'success' : 'destructive'}>
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No attempts yet. Take your first exam!
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

export default StudentDashboard;
