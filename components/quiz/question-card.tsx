/**
 * QuestionCard Component
 * 
 * Displays a single quiz question with options.
 * Features animated reveal and selection feedback.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flag, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OptionButton from './option-button';

interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK';
  options: Option[];
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  showResult?: boolean;
  imageUrl?: string;
  audioUrl?: string;
  explanation?: string;
  difficulty?: string;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  text,
  type,
  options,
  selectedOption,
  onSelectOption,
  isFlagged,
  onToggleFlag,
  showResult = false,
  imageUrl,
  audioUrl,
  explanation,
  difficulty,
}: QuestionCardProps) {
  // Get correct option for result display
  const correctOption = options.find((o) => o.isCorrect);
  const isCorrect = showResult && selectedOption === correctOption?.id;
  
  return (
    <motion.div
      className="glass-card rounded-2xl p-6 md:p-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          {difficulty && (
            <Badge
              variant={
                difficulty === 'EASY'
                  ? 'success'
                  : difficulty === 'HARD'
                  ? 'warning'
                  : difficulty === 'EXPERT'
                  ? 'destructive'
                  : 'default'
              }
            >
              {difficulty.toLowerCase()}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {audioUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const audio = new Audio(audioUrl);
                audio.play();
              }}
              aria-label="Play audio"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFlag}
            className={cn(isFlagged && 'text-amber-500')}
            aria-label={isFlagged ? 'Remove flag' : 'Flag for review'}
          >
            <Flag className={cn('h-5 w-5', isFlagged && 'fill-current')} />
          </Button>
        </div>
      </div>
      
      {/* Question image */}
      {imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={imageUrl}
            alt="Question image"
            className="w-full h-auto max-h-64 object-contain bg-muted"
          />
        </div>
      )}
      
      {/* Question text */}
      <motion.h2
        className="text-xl md:text-2xl font-semibold text-foreground mb-8 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        aria-live="polite"
      >
        {text}
      </motion.h2>
      
      {/* Options */}
      <div className="space-y-3" role="radiogroup" aria-label="Answer options">
        <AnimatePresence mode="wait">
          {options.map((option, index) => (
            <OptionButton
              key={option.id}
              option={option}
              index={index}
              isSelected={selectedOption === option.id}
              onSelect={() => onSelectOption(option.id)}
              showResult={showResult}
              disabled={showResult}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Result feedback */}
      {showResult && (
        <motion.div
          className={cn(
            'mt-6 p-4 rounded-xl',
            isCorrect
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          )}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3 }}
        >
          <p
            className={cn(
              'font-semibold mb-2',
              isCorrect ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          {!isCorrect && correctOption && (
            <p className="text-sm text-muted-foreground mb-2">
              Correct answer: <span className="font-medium text-foreground">{correctOption.text}</span>
            </p>
          )}
          {explanation && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium">Explanation:</span> {explanation}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default QuestionCard;
