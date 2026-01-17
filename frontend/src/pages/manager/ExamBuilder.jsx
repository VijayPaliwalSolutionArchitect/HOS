import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, Eye, Send, FileText,
  Clock, HelpCircle, Users, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { GlassCard } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import DashboardLayout from '../../components/DashboardLayout';
import { examsAPI, questionsAPI, categoriesAPI } from '../../lib/api';
import { getStatusColor, formatDate } from '../../lib/utils';

const ExamBuilder = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [publishing, setPublishing] = useState(null);

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    category_id: '',
    duration_minutes: 60,
    total_marks: 100,
    passing_marks: 40,
    instructions: '',
    shuffle_questions: true,
    shuffle_options: true,
    show_result_immediately: true,
    allow_review: true,
    negative_marking: false,
    question_ids: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, questionsRes, categoriesRes] = await Promise.all([
        examsAPI.getAll({ limit: 50 }),
        questionsAPI.getAll({ limit: 200 }),
        categoriesAPI.getAll(),
      ]);
      setExams(examsRes.data.exams || []);
      setQuestions(questionsRes.data.questions || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.category_id) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const examData = {
        ...newExam,
        question_ids: selectedQuestions,
        total_marks: selectedQuestions.reduce((sum, qId) => {
          const q = questions.find(q => q.id === qId);
          return sum + (q?.marks || 1);
        }, 0),
      };
      
      await examsAPI.create(examData);
      toast.success('Exam created successfully');
      setShowCreateModal(false);
      setSelectedQuestions([]);
      fetchData();
      // Reset form
      setNewExam({
        title: '',
        description: '',
        category_id: '',
        duration_minutes: 60,
        total_marks: 100,
        passing_marks: 40,
        instructions: '',
        shuffle_questions: true,
        shuffle_options: true,
        show_result_immediately: true,
        allow_review: true,
        negative_marking: false,
        question_ids: [],
      });
    } catch (error) {
      toast.error('Failed to create exam');
    }
  };

  const handlePublishExam = async (examId) => {
    setPublishing(examId);
    try {
      await examsAPI.publish(examId);
      toast.success('Exam published successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to publish exam');
    } finally {
      setPublishing(null);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = questions.filter(q => 
    !newExam.category_id || q.category_id === newExam.category_id
  );

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
      <div className="space-y-6" data-testid="exam-builder-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Exam Management</h1>
            <p className="text-muted-foreground">
              {exams.length} exams created
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-exam-btn"
          >
            <Plus className="w-4 h-4" />
            Create Exam
          </Button>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.length > 0 ? (
            exams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={getStatusColor(exam.status)}>
                      {exam.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {exam.description || 'No description'}
                  </p>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {exam.duration_minutes} minutes
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      {exam.question_count} questions
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Pass: {exam.passing_marks}/{exam.total_marks}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {exam.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePublishExam(exam.id)}
                        disabled={publishing === exam.id}
                      >
                        {publishing === exam.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No exams created yet</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                Create First Exam
              </Button>
            </div>
          )}
        </div>

        {/* Create Exam Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold">Create New Exam</h2>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Exam Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Exam Details</h3>
                    
                    <div>
                      <Label>Title *</Label>
                      <Input
                        placeholder="Enter exam title"
                        value={newExam.title}
                        onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={newExam.category_id}
                        onValueChange={(value) => {
                          setNewExam({ ...newExam, category_id: value });
                          setSelectedQuestions([]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <textarea
                        className="w-full h-20 rounded-xl border border-input bg-background px-4 py-2 text-sm"
                        placeholder="Describe the exam..."
                        value={newExam.description}
                        onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          min="5"
                          value={newExam.duration_minutes}
                          onChange={(e) => setNewExam({ ...newExam, duration_minutes: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Passing Marks</Label>
                        <Input
                          type="number"
                          min="0"
                          value={newExam.passing_marks}
                          onChange={(e) => setNewExam({ ...newExam, passing_marks: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Instructions</Label>
                      <textarea
                        className="w-full h-20 rounded-xl border border-input bg-background px-4 py-2 text-sm"
                        placeholder="Add exam instructions..."
                        value={newExam.instructions}
                        onChange={(e) => setNewExam({ ...newExam, instructions: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options</Label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newExam.shuffle_questions}
                          onChange={(e) => setNewExam({ ...newExam, shuffle_questions: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Shuffle questions</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newExam.negative_marking}
                          onChange={(e) => setNewExam({ ...newExam, negative_marking: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Enable negative marking</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newExam.show_result_immediately}
                          onChange={(e) => setNewExam({ ...newExam, show_result_immediately: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Show results immediately</span>
                      </label>
                    </div>
                  </div>

                  {/* Right: Question Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Select Questions</h3>
                      <Badge variant="secondary">
                        {selectedQuestions.length} selected
                      </Badge>
                    </div>
                    
                    <div className="h-96 overflow-y-auto border border-border rounded-xl p-4 space-y-2">
                      {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((q) => (
                          <label
                            key={q.id}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedQuestions.includes(q.id) ? 'bg-primary/10' : 'hover:bg-muted'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(q.id)}
                              onChange={() => toggleQuestionSelection(q.id)}
                              className="mt-1 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{q.type}</Badge>
                                <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                                <span className="text-xs text-muted-foreground">{q.marks} marks</span>
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          {newExam.category_id 
                            ? 'No questions in this category' 
                            : 'Select a category first'}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex justify-between text-sm">
                        <span>Total Questions:</span>
                        <span className="font-semibold">{selectedQuestions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Total Marks:</span>
                        <span className="font-semibold">
                          {selectedQuestions.reduce((sum, qId) => {
                            const q = questions.find(q => q.id === qId);
                            return sum + (q?.marks || 1);
                          }, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateExam} className="flex-1">
                  Create Exam
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamBuilder;
