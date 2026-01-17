import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, AlertCircle, ChevronLeft, ChevronRight, Flag,
  CheckCircle2, Circle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { GlassCard } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useExamStore } from '../../store';
import { examsAPI, attemptsAPI } from '../../lib/api';
import { cn, formatDuration } from '../../lib/utils';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const {
    currentExam,
    currentAttempt,
    questions,
    answers,
    currentQuestionIndex,
    timeRemaining,
    isSubmitting,
    setExamData,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    updateTimer,
    setResult,
    setSubmitting,
    resetExam,
  } = useExamStore();

  // Start exam
  useEffect(() => {
    const startExam = async () => {
      try {
        const response = await examsAPI.start(examId);
        const { exam, questions, attempt_id, time_remaining_seconds } = response.data;
        setExamData(exam, attempt_id, questions, time_remaining_seconds);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to start exam');
        toast.error('Failed to start exam');
      } finally {
        setLoading(false);
      }
    };

    startExam();

    return () => {
      // Cleanup on unmount
    };
  }, [examId, setExamData]);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || !currentAttempt) return;

    const timer = setInterval(() => {
      updateTimer(timeRemaining - 1);
      
      if (timeRemaining <= 1) {
        handleSubmit(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, currentAttempt]);

  // Handle answer selection
  const handleSelectAnswer = (answer) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    // For multi-select questions
    if (question.type === 'MCQ_MULTI') {
      const currentAnswers = answers[question.id] || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer];
      setAnswer(question.id, newAnswers);
    } else {
      setAnswer(question.id, answer);
    }
  };

  // Submit exam
  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;

    if (!autoSubmit) {
      const unanswered = questions.filter(q => !answers[q.id]).length;
      if (unanswered > 0) {
        const confirm = window.confirm(
          `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
        );
        if (!confirm) return;
      }
    }

    setSubmitting(true);

    try {
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          question_id: questionId,
          answer,
          time_spent_seconds: 0,
        })),
      };

      const response = await attemptsAPI.submit(currentAttempt, submissionData);
      setResult(response.data);
      toast.success('Exam submitted successfully!');
      navigate(`/student/result/${currentAttempt}`);
    } catch (err) {
      toast.error('Failed to submit exam');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <GlassCard className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/student/exams')}>Go Back</Button>
        </GlassCard>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex" data-testid="take-exam-page">
      {/* Main Exam Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{currentExam?.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-semibold",
            timeRemaining < 300 ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
          )}>
            <Clock className="w-5 h-5" />
            {formatDuration(timeRemaining)}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>{answeredCount} of {questions.length} answered</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Question */}
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6 mb-6">
              {/* Case Context */}
              {currentQuestion.case_context && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Read the following:</h4>
                  <p className="text-muted-foreground">{currentQuestion.case_context}</p>
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-lg font-medium mb-6" data-testid="question-text">
                {currentQuestion.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const isSelected = currentQuestion.type === 'MCQ_MULTI'
                    ? (answers[currentQuestion.id] || []).includes(option.id)
                    : answers[currentQuestion.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      className={cn(
                        "option-btn w-full p-4 rounded-xl text-left flex items-center gap-3",
                        isSelected && "selected"
                      )}
                      data-testid={`option-${option.id}`}
                    >
                      <span className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"
                      )}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </span>
                      <span className="flex-1">{option.text}</span>
                    </button>
                  );
                })}

                {/* Fill in the blank */}
                {currentQuestion.type === 'FILL_BLANK' && (
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-input bg-background focus:border-primary outline-none transition-colors"
                    data-testid="fill-blank-input"
                  />
                )}
              </div>
            </GlassCard>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                data-testid="prev-question-btn"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  data-testid="submit-exam-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Exam'
                  )}
                </Button>
              ) : (
                <Button onClick={nextQuestion} data-testid="next-question-btn">
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Question Navigation Sidebar */}
      <div className="hidden lg:flex w-80 border-l border-border bg-card/50 backdrop-blur-sm p-6 flex-col">
        <h3 className="font-semibold mb-4">Questions</h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {questions.map((q, index) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(index)}
                className={cn(
                  "w-10 h-10 rounded-lg font-medium text-sm transition-all",
                  isCurrent && "ring-2 ring-primary",
                  isAnswered
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
                data-testid={`nav-question-${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted" />
            <span>Not answered ({questions.length - answeredCount})</span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Exam'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
