'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { Navbar } from '@/components/shared/navbar';
import { GlassCard } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockQuizSets } from '@/lib/mock-data';
import Link from 'next/link';
import { BookOpen, Clock, Trophy, Search, Filter, Star } from 'lucide-react';

export default function QuizSetsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const topics = ['READING', 'LISTENING', 'VOCABULARY', 'GRAMMAR', 'GENERAL'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

  const filteredQuizzes = mockQuizSets.filter(q => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedTopic && q.topic !== selectedTopic) return false;
    if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Practice Quizzes</h1>
          <p className="text-muted-foreground mb-8">Choose a quiz to start practicing</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search quizzes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {topics.map(t => (
              <Button key={t} variant={selectedTopic === t ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTopic(selectedTopic === t ? null : t)}>
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 mb-8">
          {difficulties.map(d => (
            <Badge key={d} variant={selectedDifficulty === d ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}>
              {d}
            </Badge>
          ))}
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, i) => (
            <motion.div key={quiz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={quiz.difficulty === 'EASY' ? 'success' : quiz.difficulty === 'HARD' ? 'warning' : quiz.difficulty === 'EXPERT' ? 'destructive' : 'default'}>
                    {quiz.difficulty}
                  </Badge>
                  {quiz.featured && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </div>
                <Badge variant="secondary" className="w-fit mb-3">{quiz.topic}</Badge>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{quiz.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{quiz.totalQuestions}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{quiz.duration}m</span>
                  <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />{quiz.avgBandScore}</span>
                </div>
                <Link href={`/quiz/${quiz.slug}`}>
                  <Button className="w-full">Start Quiz</Button>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No quizzes found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
