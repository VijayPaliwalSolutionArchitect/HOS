import { useEffect, useRef } from 'react';
import { animateTextReveal, animateOnScroll, staggerAnimation } from '../../utils/animations';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

/**
 * Home Landing Page Component
 * Features:
 * - Hero section with GSAP animations
 * - Features section with scroll-triggered animations
 * - About section with parallax effects
 * - CTA section with animated backgrounds
 * - Fully responsive design
 */
const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Hero section animations
    if (heroRef.current) {
      animateTextReveal('.hero-title', { delay: 0.2 });
      animateTextReveal('.hero-subtitle', { delay: 0.5, y: 30 });
      animateTextReveal('.hero-cta', { delay: 0.8, y: 20 });
    }

    // Features section scroll animations
    if (featuresRef.current) {
      staggerAnimation('.feature-card', {
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
        },
      });
    }

    // About section animations
    if (aboutRef.current) {
      animateOnScroll('.about-content', {
        y: 80,
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 70%',
        },
      });
    }

    // CTA section animations
    if (ctaRef.current) {
      animateOnScroll('.cta-content', {
        scale: 0.9,
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 75%',
        },
      });
    }
  }, []);

  const features = [
    {
      title: 'Fast & Modern',
      description: 'Built with Vite for lightning-fast development and optimized production builds.',
      icon: '⚡',
    },
    {
      title: 'Beautiful UI',
      description: 'Stunning designs with Tailwind CSS and smooth GSAP animations.',
      icon: '🎨',
    },
    {
      title: 'Dark Mode',
      description: 'Multiple theme variants including light, dark, ocean, sunset, and forest.',
      icon: '🌙',
    },
    {
      title: 'Fully Responsive',
      description: 'Mobile-first design that works seamlessly across all devices.',
      icon: '📱',
    },
    {
      title: 'Best Practices',
      description: 'Clean code, proper documentation, and accessibility built-in.',
      icon: '✨',
    },
    {
      title: 'Easy to Extend',
      description: 'Modular architecture makes it simple to add new features.',
      icon: '🚀',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[var(--color-accent)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display text-gradient mb-6 leading-tight">
            Welcome to MEAN Stack
          </h1>
          <p className="hero-subtitle text-xl sm:text-2xl md:text-3xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
            Build stunning web applications with modern technologies, beautiful animations, and dynamic theming
          </p>
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="features-section py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)]"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-gradient mb-4">
              Amazing Features
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Everything you need to build modern web applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card group"
                hoverable
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        ref={aboutRef}
        className="about-section py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="about-content">
              <h2 className="text-4xl sm:text-5xl font-bold font-display text-gradient mb-6">
                Built with Modern Technologies
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-6">
                Our MEAN stack application leverages the latest web technologies to deliver exceptional performance and user experience.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                    <span className="text-2xl">⚛️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                      React 18
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      Latest React features for building interactive UIs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-secondary)]/20 flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                      Vite
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      Lightning-fast build tool and dev server
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                      Tailwind CSS
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      Utility-first CSS framework for rapid UI development
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-content">
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-1">
                  <div className="w-full h-full rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4 animate-float">🚀</div>
                      <p className="text-2xl font-bold text-gradient">
                        Ready to Launch
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        ref={ctaRef}
        className="cta-section py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] opacity-10 animate-gradient" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="cta-content text-center bg-[var(--bg-secondary)] rounded-3xl p-12 shadow-2xl border border-[var(--border-color)]">
            <h2 className="text-4xl sm:text-5xl font-bold font-display text-gradient mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Join thousands of developers building amazing applications with our modern stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Start Building
              </Button>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
