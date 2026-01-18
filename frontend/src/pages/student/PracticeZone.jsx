import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Brain, Clock, Target, PlayCircle, Star, Filter,
  BookOpen, Award, TrendingUp, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import DashboardLayout from '../../components/DashboardLayout';
import { examsAPI, categoriesAPI } from '../../lib/api';
import { getDifficultyColor } from '../../lib/utils';

const PracticeZone = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, categoriesRes] = await Promise.all([
          examsAPI.getAll({ status: 'PUBLISHED' }),
          categoriesAPI.getAll()
        ]);
        setExams(examsRes.data.exams || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch practice data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredExams = exams.filter(exam => {
    if (selectedCategory && exam.category_id !== selectedCategory) return false;
    return true;
  });

  // Mock data for practice modes
  const practiceModes = [
    {
      id: 'quick',
      name: 'Quick Practice',
      description: '10 random questions, 15 minutes',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      duration: '15 min',
      questions: 10
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: 'Review key concepts quickly',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      duration: 'Flexible',
      questions: '50+'
    },
    {
      id: 'timed',
      name: 'Timed Quiz',
      description: 'Full exam simulation',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      duration: '60 min',
      questions: 40
    },
    {
      id: 'targeted',
      name: 'Targeted Practice',
      description: 'Focus on weak areas',
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      duration: '30 min',
      questions: 20
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading practice zone...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-outfit">Practice Zone</h1>
        <p className="text-muted-foreground">
          Sharpen your skills with various practice modes and mock exams
        </p>
      </div>

      {/* Practice Modes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Practice Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${mode.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${mode.color}`} />
                    </div>
                    <CardTitle className="text-lg">{mode.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {mode.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {mode.duration}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {mode.questions} questions
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Available Practice Exams */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Practice Exams</h2>
        
        {filteredExams.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No practice exams available</h3>
            <p className="text-muted-foreground">Check back later for new practice opportunities</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Practice
                      </Badge>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                        {exam.duration_minutes} min
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {exam.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {exam.category_name}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {exam.description || 'Practice exam to test your knowledge'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {exam.question_count || 0} questions
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {exam.total_marks} marks
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link to={`/student/exams/${exam.id}/start`}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Practice
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Challenge (Mock) */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Award className="w-6 h-6 mr-2" />
                  <h3 className="text-2xl font-bold">Daily Challenge</h3>
                </div>
                <p className="text-white/90 mb-4">
                  Complete today's challenge to earn bonus XP and climb the leaderboard!
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    15 minutes
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    +50 XP
                  </div>
                </div>
              </div>
              <Button className="bg-white text-primary hover:bg-white/90">
                Start Challenge
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Stats */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Practice Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
                <Badge variant="outline">This Week</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <p className="text-sm text-muted-foreground">Practice Sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <Badge variant="outline">Average</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">0%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-blue-500" />
                <Badge variant="outline">Total</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <p className="text-sm text-muted-foreground">Questions Solved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PracticeZone;
