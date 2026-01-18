import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, FileText, Award, Download, Calendar,
  BarChart3, PieChart, Filter, Target, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardAPI, examsAPI, attemptsAPI } from '../../lib/api';
import { toast } from 'sonner';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, performanceRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getPerformanceChart(parseInt(dateRange)),
      ]);

      setStats(statsRes.data);
      setPerformanceData(performanceRes.data || []);

      // Mock data for categories and engagement
      setCategoryData([
        { name: 'Mathematics', students: 245, avgScore: 78, passRate: 82 },
        { name: 'Science', students: 189, avgScore: 72, passRate: 75 },
        { name: 'English', students: 312, avgScore: 85, passRate: 88 },
        { name: 'History', students: 156, avgScore: 68, passRate: 70 },
        { name: 'Programming', students: 203, avgScore: 81, passRate: 79 },
      ]);

      setEngagementData([
        { month: 'Jan', active: 420, new: 85, returning: 335 },
        { month: 'Feb', active: 468, new: 92, returning: 376 },
        { month: 'Mar', active: 512, new: 78, returning: 434 },
        { month: 'Apr', active: 589, new: 103, returning: 486 },
        { month: 'May', active: 645, new: 96, returning: 549 },
        { month: 'Jun', active: 701, new: 112, returning: 589 },
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    toast.success(`Exporting ${type} data...`, {
      description: 'This feature will be available soon.'
    });
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const passFailData = [
    { name: 'Passed', value: stats?.total_passed || 0, color: '#10B981' },
    { name: 'Failed', value: stats?.total_failed || 0, color: '#EF4444' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="manager-analytics">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into exam performance and student engagement
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button variant="outline" onClick={() => handleExport('CSV')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Students',
              value: stats?.total_students || 0,
              change: '+12%',
              icon: Users,
              gradient: 'from-indigo-500 to-purple-500',
            },
            {
              title: 'Total Exams',
              value: stats?.total_exams || 0,
              change: '+8%',
              icon: FileText,
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              title: 'Avg Pass Rate',
              value: `${Math.round(stats?.average_pass_rate || 0)}%`,
              change: '+5%',
              icon: Award,
              gradient: 'from-orange-500 to-amber-500',
            },
            {
              title: 'Avg Score',
              value: `${Math.round(stats?.average_score || 0)}%`,
              change: '+3%',
              icon: Target,
              gradient: 'from-pink-500 to-rose-500',
            },
          ].map((metric, i) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`stat-card bg-gradient-to-br ${metric.gradient}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{metric.title}</p>
                    <p className="text-3xl font-bold mt-1">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-white/80" />
                      <span className="text-white/80 text-sm">{metric.change}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <metric.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
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
                        name="Avg Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pass/Fail Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Pass/Fail Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={passFailData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {passFailData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Popular Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Popular Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Student Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="active"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        name="Active Users"
                      />
                      <Line
                        type="monotone"
                        dataKey="new"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="New Users"
                      />
                      <Line
                        type="monotone"
                        dataKey="returning"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        name="Returning"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Category Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 font-semibold">Students</th>
                      <th className="text-left py-3 px-4 font-semibold">Avg Score</th>
                      <th className="text-left py-3 px-4 font-semibold">Pass Rate</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((category, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{category.name}</td>
                        <td className="py-3 px-4">{category.students}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${category.avgScore}%` }}
                              />
                            </div>
                            <span className="text-sm">{category.avgScore}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{category.passRate}%</td>
                        <td className="py-3 px-4">
                          <Badge variant={category.passRate >= 75 ? 'success' : 'warning'}>
                            {category.passRate >= 75 ? 'Good' : 'Needs Attention'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
