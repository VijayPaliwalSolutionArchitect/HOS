import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Star, TrendingUp, Award, PlayCircle,
  CheckCircle, Filter, Search, Grid, List
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { coursesAPI, categoriesAPI } from '../../lib/api';
import { formatNumber, getDifficultyColor } from '../../lib/utils';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    featured: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          coursesAPI.getAll({ is_published: true }),
          categoriesAPI.getAll()
        ]);
        setCourses(coursesRes.data.courses || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter(course => {
    if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && course.category_id !== filters.category) {
      return false;
    }
    if (filters.difficulty && course.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.featured && !course.is_featured) {
      return false;
    }
    return true;
  });

  const CourseCard = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50">
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {course.is_featured && (
            <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              {course.rating?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <CardTitle className="text-xl leading-tight">{course.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {course.category_name}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {course.duration_hours}h
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {formatNumber(course.enrollment_count)} enrolled
            </div>
          </div>

          {/* Mock progress for demo */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>

          <Button className="w-full" asChild>
            <Link to={`/student/courses/${course.id}`}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue Learning
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const CourseListItem = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-4"
    >
      <Card className="hover:shadow-md transition-all duration-300">
        <div className="flex">
          <div className="w-64 h-48 flex-shrink-0">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
              alt={course.title}
              className="w-full h-full object-cover rounded-l-2xl"
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  {course.is_featured && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-1">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.category_name}</p>
              </div>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                {course.rating?.toFixed(1) || 'N/A'}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {course.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.duration_hours} hours
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {formatNumber(course.enrollment_count)} students
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <Button asChild>
                <Link to={`/student/courses/${course.id}`}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Continue
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-outfit">My Courses</h1>
        <p className="text-muted-foreground">
          Continue your learning journey with {filteredCourses.length} available courses
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="">All Levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="EXPERT">Expert</option>
          </select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filters.featured ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, featured: !filters.featured })}
          >
            <Star className="w-4 h-4 mr-2" />
            Featured Only
          </Button>
        </div>
      </div>

      {/* Courses Grid/List */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div>
          {filteredCourses.map(course => (
            <CourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Courses;
