import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, TrendingDown, Award, Target, CheckCircle,
  XCircle, Clock, Calendar, Filter, Download, Eye
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { attemptsAPI, dashboardAPI } from '../../lib/api';
import { formatDate, formatDuration } from '../../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const Results = () => {
  const [attempts, setAttempts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    highestScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'passed', 'failed'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attemptsRes, performanceRes] = await Promise.all([
          attemptsAPI.getAll({ limit: 100 }),
          dashboardAPI.getPerformanceChart(90)
        ]);
        
        const allAttempts = attemptsRes.data.attempts || [];
        setAttempts(allAttempts);
        setPerformanceData(performanceRes.data || []);

        // Calculate stats
        const evaluated = allAttempts.filter(a => a.status === 'EVALUATED');
        const totalAttempts = evaluated.length;
        const averageScore = totalAttempts > 0
          ? evaluated.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts
          : 0;
        const passRate = totalAttempts > 0
          ? (evaluated.filter(a => a.passed).length / totalAttempts) * 100
          : 0;
        const highestScore = totalAttempts > 0
          ? Math.max(...evaluated.map(a => a.percentage || 0))
          : 0;

        setStats({ totalAttempts, averageScore, passRate, highestScore });
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'passed') return attempt.passed;
    if (filter === 'failed') return !attempt.passed && attempt.status === 'EVALUATED';
    return attempt.status === 'EVALUATED';
  });

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-outfit">My Results</h1>
        <p className="text-muted-foreground">
          Track your progress and performance across all exams
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-primary" />
              <Badge variant="outline">Total</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalAttempts}</div>
            <p className="text-sm text-muted-foreground">Exams Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <Badge variant="outline">Average</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <Badge variant="outline">Pass Rate</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.passRate.toFixed(0)}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-500" />
              <Badge variant="outline">Best</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.highestScore.toFixed(0)}%</div>
            <p className="text-sm text-muted-foreground">Highest Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Trends (Last 90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average_score"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  name="Average Score"
                />
                <Line
                  type="monotone"
                  dataKey="pass_rate"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Pass Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Results
          </Button>
          <Button
            variant={filter === 'passed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('passed')}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Passed
          </Button>
          <Button
            variant={filter === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('failed')}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Failed
          </Button>
        </div>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Results List */}
      {filteredAttempts.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'all' 
              ? "You haven't completed any exams yet"
              : `No ${filter} exams found`
            }
          </p>
          <Button asChild>
            <Link to="/student/exams">Start an Exam</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => (
            <motion.div
              key={attempt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {attempt.exam_title || 'Unknown Exam'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(attempt.submitted_at || attempt.started_at)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDuration(attempt.time_taken_seconds)}
                            </div>
                          </div>
                        </div>
                        <Badge className={getScoreBgColor(attempt.percentage)}>
                          {attempt.percentage?.toFixed(1)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Score</p>
                          <p className="text-lg font-semibold">
                            {attempt.score}/{attempt.total_marks || 100}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Correct</p>
                          <p className="text-lg font-semibold text-green-600">
                            {attempt.correct_count || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Incorrect</p>
                          <p className="text-lg font-semibold text-red-600">
                            {attempt.incorrect_count || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {attempt.passed ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Passed
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        
                        {attempt.percentage >= stats.highestScore - 1 && (
                          <Badge className="bg-yellow-500 text-white">
                            <Award className="w-3 h-3 mr-1" />
                            Personal Best
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button asChild size="sm">
                        <Link to={`/student/results/${attempt.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      {attempt.exam_id && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/student/exams/${attempt.exam_id}/start`}>
                            Retake Exam
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <Progress value={attempt.percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Results;
