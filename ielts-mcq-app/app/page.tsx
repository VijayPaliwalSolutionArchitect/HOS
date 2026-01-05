import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Trophy, Brain, Zap, Target, Users } from 'lucide-react';

export default function HomePage() {
  const features = [
    { icon: BookOpen, title: 'Comprehensive Practice', description: 'Thousands of questions covering all IELTS sections' },
    { icon: Brain, title: 'AI-Powered Insights', description: 'Get personalized feedback and improvement suggestions' },
    { icon: Trophy, title: 'Gamified Learning', description: 'Earn XP, badges, and climb the leaderboard' },
    { icon: Zap, title: 'Instant Results', description: 'Real-time scoring with detailed explanations' },
    { icon: Target, title: 'Track Progress', description: 'Monitor your improvement over time' },
    { icon: Users, title: 'Community', description: 'Compete with learners worldwide' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Master Your{' '}
              <span className="text-gradient">IELTS Exam</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Practice with AI-powered MCQ tests, track your progress, and achieve your target band score.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto gap-2">
                  Start Practicing Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">10K+</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">50K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">7.5</div>
                <div className="text-sm text-muted-foreground">Avg Band Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to ace your IELTS exam in one platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students who have improved their IELTS scores with our platform.
            </p>
            <Link href="/register">
              <Button size="xl" className="gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
