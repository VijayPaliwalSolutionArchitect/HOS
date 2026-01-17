import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit2, Trash2, Brain, HelpCircle,
  CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { GlassCard } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import DashboardLayout from '../../components/DashboardLayout';
import { questionsAPI, categoriesAPI, aiAPI } from '../../lib/api';
import { getDifficultyColor, cn } from '../../lib/utils';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    type: 'all',
  });

  const [newQuestion, setNewQuestion] = useState({
    category_id: '',
    type: 'MCQ_SINGLE',
    text: '',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' },
    ],
    correct_answer: '',
    explanation: '',
    difficulty: 'MEDIUM',
    marks: 1,
    negative_marks: 0,
    tags: [],
  });

  const [aiRequest, setAiRequest] = useState({
    category_id: '',
    topic: '',
    difficulty: 'MEDIUM',
    question_type: 'MCQ_SINGLE',
    count: 5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, categoriesRes] = await Promise.all([
        questionsAPI.getAll({ limit: 100 }),
        categoriesAPI.getAll(),
      ]);
      setQuestions(questionsRes.data.questions || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      await questionsAPI.create(newQuestion);
      toast.success('Question created successfully');
      setShowCreateModal(false);
      fetchData();
      // Reset form
      setNewQuestion({
        category_id: '',
        type: 'MCQ_SINGLE',
        text: '',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' },
        ],
        correct_answer: '',
        explanation: '',
        difficulty: 'MEDIUM',
        marks: 1,
        negative_marks: 0,
        tags: [],
      });
    } catch (error) {
      toast.error('Failed to create question');
    }
  };

  const handleGenerateAI = async () => {
    if (!aiRequest.category_id || !aiRequest.topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await aiAPI.generateQuestions(aiRequest);
      toast.success(`Generated ${response.data.questions?.length || 0} questions`);
      setShowAIModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await questionsAPI.delete(questionId);
      toast.success('Question deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || q.category_id === filters.category;
    const matchesDifficulty = filters.difficulty === 'all' || q.difficulty === filters.difficulty;
    const matchesType = filters.type === 'all' || q.type === filters.type;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const questionTypes = [
    { value: 'MCQ_SINGLE', label: 'Single Choice' },
    { value: 'MCQ_MULTI', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'FILL_BLANK', label: 'Fill in Blank' },
    { value: 'CASE_BASED', label: 'Case Based' },
  ];

  const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

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
      <div className="space-y-6" data-testid="question-bank-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Question Bank</h1>
            <p className="text-muted-foreground">
              {questions.length} questions in your bank
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowAIModal(true)}
              data-testid="ai-generate-btn"
            >
              <Brain className="w-4 h-4" />
              AI Generate
            </Button>
            <Button
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
              data-testid="add-question-btn"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
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
            <Select
              value={filters.difficulty}
              onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {difficulties.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {questionTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="secondary">{question.marks} marks</Badge>
                        {question.ai_generated && (
                          <Badge variant="outline" className="gap-1">
                            <Brain className="w-3 h-3" /> AI
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mb-2">{question.text}</p>
                      {question.options && (
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {question.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={cn(
                                "flex items-center gap-2",
                                (Array.isArray(question.correct_answer) 
                                  ? question.correct_answer.includes(opt.id)
                                  : question.correct_answer === opt.id) && "text-green-600"
                              )}
                            >
                              {(Array.isArray(question.correct_answer) 
                                ? question.correct_answer.includes(opt.id)
                                : question.correct_answer === opt.id) ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              {opt.id}. {opt.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No questions found</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                Create First Question
              </Button>
            </div>
          )}
        </div>

        {/* Create Question Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-6">Create Question</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newQuestion.category_id}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Question Text</Label>
                  <textarea
                    className="w-full h-24 rounded-xl border border-input bg-background px-4 py-2 text-sm"
                    placeholder="Enter your question..."
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  />
                </div>

                {(newQuestion.type === 'MCQ_SINGLE' || newQuestion.type === 'MCQ_MULTI' || newQuestion.type === 'TRUE_FALSE') && (
                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2 mt-2">
                      {newQuestion.options.map((opt, i) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <span className="w-6 font-medium">{opt.id}.</span>
                          <Input
                            placeholder={`Option ${opt.id.toUpperCase()}`}
                            value={opt.text}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[i].text = e.target.value;
                              setNewQuestion({ ...newQuestion, options: newOptions });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Correct Answer</Label>
                    <Input
                      placeholder="e.g., a or a,b,c"
                      value={newQuestion.correct_answer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={newQuestion.difficulty}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Explanation (Optional)</Label>
                  <textarea
                    className="w-full h-20 rounded-xl border border-input bg-background px-4 py-2 text-sm"
                    placeholder="Explain why this answer is correct..."
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateQuestion} className="flex-1">
                  Create Question
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Generate Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Question Generator</h2>
                  <p className="text-sm text-muted-foreground">Generate questions using AI</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={aiRequest.category_id}
                    onValueChange={(value) => setAiRequest({ ...aiRequest, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Topic *</Label>
                  <Input
                    placeholder="e.g., Grammar - Tenses, Algebra basics"
                    value={aiRequest.topic}
                    onChange={(e) => setAiRequest({ ...aiRequest, topic: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={aiRequest.question_type}
                      onValueChange={(value) => setAiRequest({ ...aiRequest, question_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={aiRequest.difficulty}
                      onValueChange={(value) => setAiRequest({ ...aiRequest, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={aiRequest.count}
                    onChange={(e) => setAiRequest({ ...aiRequest, count: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAIModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleGenerateAI} className="flex-1" disabled={aiGenerating}>
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuestionBank;
