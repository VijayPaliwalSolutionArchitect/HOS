import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, Clock, CheckCircle2, XCircle, HelpCircle,
  ArrowLeft, Share2, Download, RotateCcw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { GlassCard } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { attemptsAPI } from '../../lib/api';
import { formatDuration, cn } from '../../lib/utils';

const ExamResult = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await attemptsAPI.getById(attemptId);
        setResult(response.data);
      } catch (error) {
        console.error('Failed to fetch result:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Result not found</p>
          <Link to="/student/exams">
            <Button className="mt-4">Back to Exams</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: 'Score', value: `${result.score}/${result.total_marks || 0}`, icon: Target },
    { label: 'Correct', value: result.correct_count, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Incorrect', value: result.incorrect_count, icon: XCircle, color: 'text-red-500' },
    { label: 'Unanswered', value: result.unanswered_count, icon: HelpCircle, color: 'text-yellow-500' },
    { label: 'Time Taken', value: formatDuration(result.time_taken_seconds || 0), icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8" data-testid="exam-result-page">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/student/exams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading">{result.exam_title}</h1>
            <p className="text-muted-foreground">Exam Results</p>
          </div>
        </div>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className={cn(
            "p-8 text-center",
            result.passed ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10" : "bg-gradient-to-br from-red-500/10 to-rose-500/10"
          )}>
            <div className={cn(
              "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4",
              result.passed ? "bg-green-500" : "bg-red-500"
            )}>
              {result.passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <Target className="w-12 h-12 text-white" />
              )}
            </div>
            
            <Badge 
              variant={result.passed ? "success" : "destructive"}
              className="text-lg px-4 py-1 mb-4"
            >
              {result.passed ? 'PASSED' : 'FAILED'}
            </Badge>

            <div className="text-5xl font-bold mb-2" data-testid="score-percentage">
              {Math.round(result.percentage)}%
            </div>
            <p className="text-muted-foreground">
              You scored {result.score} out of {result.total_marks || 0} marks
            </p>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-4 text-center">
                <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Detailed Results */}
        {result.detailed_results && result.detailed_results.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Question Analysis</h3>
            <div className="space-y-4">
              {result.detailed_results.map((item, index) => (
                <div
                  key={item.question_id}
                  className={cn(
                    "p-4 rounded-xl border",
                    item.is_correct ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      item.is_correct ? "bg-green-500" : "bg-red-500"
                    )}>
                      {item.is_correct ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        Q{index + 1}: {item.question_text}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={item.is_correct ? "text-green-600" : "text-red-600"}>
                            {Array.isArray(item.your_answer) 
                              ? item.your_answer.join(', ') 
                              : item.your_answer || 'Not answered'}
                          </span>
                        </div>
                        {!item.is_correct && (
                          <div>
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-green-600">
                              {Array.isArray(item.correct_answer) 
                                ? item.correct_answer.join(', ') 
                                : item.correct_answer}
                            </span>
                          </div>
                        )}
                      </div>
                      {item.explanation && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <strong>Explanation:</strong> {item.explanation}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={item.is_correct ? "success" : "destructive"}>
                        {item.marks_obtained > 0 ? `+${item.marks_obtained}` : item.marks_obtained}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/student/exams">
            <Button variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Take Another Exam
            </Button>
          </Link>
          <Link to="/student/dashboard">
            <Button className="gap-2">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExamResult;
