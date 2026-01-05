'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth, useQuizStore, useTimer, useConfetti } from '@/hooks';
import { QuestionCard, Timer, ProgressBar } from '@/components/quiz';
import { GlassCard, ConfettiCanvas } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { mockQuizSets, mockQuestions } from '@/lib/mock-data';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Flag, Send, Pause, Play, X, Home } from 'lucide-react';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, addXP } = useAuth();
  const { fireCelebration } = useConfetti();
  
  const {
    isStarted, isPaused, isCompleted, questions, currentIndex, answers, duration,
    initQuiz, selectAnswer, toggleFlag, nextQuestion, previousQuestion, goToQuestion,
    pause, resume, complete, reset,
  } = useQuizStore();

  const [showExitModal, setShowExitModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizSet, setQuizSet] = useState<typeof mockQuizSets[0] | null>(null);

  // Timer hook
  const timer = useTimer({
    onTimeUp: () => {
      toast.error('Time\'s up!');
      handleSubmit();
    },
    onWarning: () => toast('1 minute remaining!', { icon: '⏰' }),
  });

  // Find quiz set
  useEffect(() => {
    const slug = params.slug as string;
    const found = mockQuizSets.find(q => q.slug === slug);
    if (found) setQuizSet(found);
    else router.push('/quiz/sets');
  }, [params.slug, router]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  // Current question and answer
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !showResults && nextQuestion(),
    onSwipedRight: () => !showResults && previousQuestion(),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResults || !isStarted) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextQuestion();
      if (e.key === 'ArrowLeft') previousQuestion();
      if (e.key === ' ') { e.preventDefault(); isPaused ? resume() : pause(); }
      if (e.key === 'f') currentQuestion && toggleFlag(currentQuestion.id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isPaused, showResults, currentQuestion]);

  // Start quiz
  const handleStart = () => {
    if (!quizSet) return;
    reset();
    initQuiz({
      attemptId: uuidv4(),
      quizSetId: quizSet.id,
      quizTitle: quizSet.title,
      questions: mockQuestions.slice(0, quizSet.totalQuestions).map((q, i) => ({ ...q, order: i + 1 })),
      duration: quizSet.duration,
    });
    setShowStartModal(false);
  };

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    complete();
    setShowResults(true);
    fireCelebration();
    
    // Calculate XP
    const correctCount = Object.values(answers).filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q?.options.find(o => o.id === a.selectedOption)?.isCorrect;
    }).length;
    
    const xpEarned = correctCount * 10 + 50; // Base XP + per correct answer
    await addXP(xpEarned);
    toast.success(`+${xpEarned} XP earned!`);
  }, [answers, questions, complete, addXP, fireCelebration]);

  // Question status for progress bar
  const questionStatus = questions.map((q, i) => ({
    id: q.id,
    isAnswered: !!answers[q.id]?.selectedOption,
    isFlagged: answers[q.id]?.flaggedForReview || false,
    isCurrent: i === currentIndex,
  }));

  const answeredCount = Object.values(answers).filter(a => a.selectedOption).length;

  if (authLoading || !quizSet) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-background" {...swipeHandlers}>
      <ConfettiCanvas trigger={showResults} type="celebration" />

      {/* Start Modal */}
      <AnimatePresence>
        {showStartModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-2">{quizSet.title}</h2>
              <p className="text-muted-foreground mb-6">{quizSet.description}</p>
              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="p-3 rounded-lg bg-muted"><div className="font-bold">{quizSet.totalQuestions}</div><div className="text-muted-foreground">Questions</div></div>
                <div className="p-3 rounded-lg bg-muted"><div className="font-bold">{quizSet.duration}m</div><div className="text-muted-foreground">Duration</div></div>
                <div className="p-3 rounded-lg bg-muted"><div className="font-bold">{quizSet.passScore}%</div><div className="text-muted-foreground">Pass Score</div></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.push('/quiz/sets')}>Cancel</Button>
                <Button className="flex-1" onClick={handleStart}>Start Quiz</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Header */}
      {isStarted && !showStartModal && (
        <header className="sticky top-0 z-40 glass-card border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" size="icon" onClick={() => setShowExitModal(true)}><X className="w-5 h-5" /></Button>
              <Timer remainingTime={timer.remainingTime} totalTime={duration * 60} isPaused={isPaused} onPause={pause} onResume={resume} />
              <Button onClick={handleSubmit} className="gap-2"><Send className="w-4 h-4" />Submit</Button>
            </div>
            <div className="mt-3">
              <ProgressBar current={currentIndex + 1} total={questions.length} answered={answeredCount} questions={questionStatus} onQuestionClick={goToQuestion} showDots={questions.length <= 20} />
            </div>
          </div>
        </header>
      )}

      {/* Quiz Content */}
      {isStarted && !showStartModal && !showResults && currentQuestion && (
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              text={currentQuestion.text}
              type={currentQuestion.type}
              options={currentQuestion.options}
              selectedOption={currentAnswer?.selectedOption || null}
              onSelectOption={(optionId) => selectAnswer(currentQuestion.id, optionId)}
              isFlagged={currentAnswer?.flaggedForReview || false}
              onToggleFlag={() => toggleFlag(currentQuestion.id)}
              difficulty={currentQuestion.difficulty}
            />
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 max-w-3xl mx-auto">
            <Button variant="outline" onClick={previousQuestion} disabled={currentIndex === 0} className="gap-2">
              <ChevronLeft className="w-4 h-4" />Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button onClick={nextQuestion} className="gap-2">Next<ChevronRight className="w-4 h-4" /></Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2"><Send className="w-4 h-4" />Submit</Button>
            )}
          </div>
        </main>
      )}

      {/* Results */}
      {showResults && (
        <main className="container mx-auto px-4 py-8">
          <GlassCard className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Quiz Complete! 🎉</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-emerald-500/10">
                <div className="text-3xl font-bold text-emerald-600">
                  {Object.values(answers).filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.options.find(o => o.id === a.selectedOption)?.isCorrect;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10">
                <div className="text-3xl font-bold text-red-600">
                  {questions.length - Object.values(answers).filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.options.find(o => o.id === a.selectedOption)?.isCorrect;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="p-4 rounded-xl bg-primary/10">
                <div className="text-3xl font-bold text-primary">
                  {Math.round((Object.values(answers).filter(a => {
                    const q = questions.find(q => q.id === a.questionId);
                    return q?.options.find(o => o.id === a.selectedOption)?.isCorrect;
                  }).length / questions.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="gap-2"><Home className="w-4 h-4" />Dashboard</Button>
              <Button onClick={() => { reset(); setShowResults(false); setShowStartModal(true); }}>Try Again</Button>
            </div>
          </GlassCard>
        </main>
      )}

      {/* Exit Modal */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="max-w-sm w-full text-center">
              <h3 className="text-xl font-bold mb-2">Exit Quiz?</h3>
              <p className="text-muted-foreground mb-6">Your progress will be saved. You can resume later.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowExitModal(false)}>Continue</Button>
                <Button variant="destructive" className="flex-1" onClick={() => { reset(); router.push('/dashboard'); }}>Exit</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
