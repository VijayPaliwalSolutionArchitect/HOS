import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Trophy, Brain, Zap, Target, Users, 
  ArrowRight, CheckCircle2, GraduationCap, BarChart3,
  Shield, Globe
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { GlassCard } from '../components/ui/card';

const LandingPage = () => {
  const features = [
    { icon: BookOpen, title: 'Comprehensive Courses', description: 'Access structured learning content across multiple subjects' },
    { icon: Brain, title: 'AI-Powered Questions', description: 'Get intelligent question generation for better practice' },
    { icon: Trophy, title: 'Gamified Learning', description: 'Earn XP, badges, and climb the leaderboard' },
    { icon: Zap, title: 'Instant Results', description: 'Real-time scoring with detailed explanations' },
    { icon: Target, title: 'Track Progress', description: 'Monitor your improvement with analytics' },
    { icon: Users, title: 'Multi-Tenant', description: 'Perfect for institutions and coaching centers' },
  ];

  const stats = [
    { value: '10K+', label: 'Questions' },
    { value: '50K+', label: 'Students' },
    { value: '500+', label: 'Institutions' },
    { value: '95%', label: 'Pass Rate' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'IELTS Student', text: 'Improved my band score from 6.5 to 8.0 in just 2 months!' },
    { name: 'Dr. Michael Chen', role: 'Institution Admin', text: 'The best platform for managing our examination system.' },
    { name: 'Emma Williams', role: 'Teacher', text: 'AI question generation saves me hours of preparation time.' },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">EduExam Pro</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" data-testid="nav-login-btn">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button data-testid="nav-register-btn">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-hero-pattern">
        {/* Animated Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Learning Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight">
              Master Your{' '}
              <span className="text-gradient">Exams</span>
              <br />with Confidence
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The all-in-one platform for online courses, AI-powered examinations, 
              and comprehensive performance analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="xl" className="gap-2" data-testid="hero-cta-btn">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl" data-testid="hero-login-btn">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for comprehensive online education and examination
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 h-full hover:-translate-y-1 transition-transform cursor-pointer" data-testid={`feature-card-${i}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4">How It Works</h2>
            <p className="text-muted-foreground">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account as student, teacher, or institution' },
              { step: '02', title: 'Explore', desc: 'Browse courses and practice exams in your subject area' },
              { step: '03', title: 'Excel', desc: 'Track progress, earn badges, and achieve your goals' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4">What Our Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((item, i) => (
              <GlassCard key={i} className="p-6">
                <p className="text-muted-foreground mb-4">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.role}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-12 text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <h2 className="text-4xl font-bold font-heading mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students and institutions who have elevated their education with EduExam Pro.
            </p>
            <Link to="/register">
              <Button size="xl" className="gap-2" data-testid="cta-btn">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">EduExam Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 EduExam Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
