import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, HelpCircle, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { GlassCard } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import DashboardLayout from '../../components/DashboardLayout';
import { examsAPI, categoriesAPI } from '../../lib/api';
import { getDifficultyColor } from '../../lib/utils';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, categoriesRes] = await Promise.all([
          examsAPI.getAll({ limit: 50 }),
          categoriesAPI.getAll(),
        ]);
        setExams(examsRes.data.exams || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || exam.category_id === filters.category;
    return matchesSearch && matchesCategory;
  });

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
      <div className="space-y-6" data-testid="student-exams">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Available Exams</h1>
            <p className="text-muted-foreground">Choose an exam to test your knowledge</p>
          </div>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
                data-testid="exam-search-input"
              />
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger className="w-full md:w-48" data-testid="category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.length > 0 ? (
            filteredExams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-6 h-full flex flex-col hover:-translate-y-1 transition-transform" data-testid={`exam-card-${exam.id}`}>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary">{exam.status}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {exam.description || 'Test your knowledge with this comprehensive exam'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {exam.duration_minutes} min
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <HelpCircle className="w-4 h-4" />
                        {exam.question_count} questions
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Pass:</span>
                      <span className="font-medium">{exam.passing_marks}/{exam.total_marks} marks</span>
                    </div>
                  </div>
                  <Link to={`/student/exam/${exam.id}`} className="mt-4">
                    <Button className="w-full" data-testid={`take-exam-btn-${exam.id}`}>
                      Take Exam
                    </Button>
                  </Link>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No exams found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentExams;
