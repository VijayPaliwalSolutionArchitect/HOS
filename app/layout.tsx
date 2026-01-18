import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

// Load Inter font with variable weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Application Metadata
 * SEO and PWA configuration
 */
export const metadata: Metadata = {
  title: {
    default: 'IELTS MCQ Practice | Master Your IELTS Exam',
    template: '%s | IELTS MCQ Practice',
  },
  description:
    'Practice IELTS with our comprehensive MCQ platform. Features real-time scoring, AI-powered insights, gamification, and detailed progress tracking.',
  keywords: [
    'IELTS',
    'MCQ',
    'practice',
    'exam preparation',
    'English test',
    'band score',
    'reading',
    'listening',
  ],
  authors: [{ name: 'IELTS MCQ Team' }],
  creator: 'IELTS MCQ Practice',
  publisher: 'IELTS MCQ Practice',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ielts-mcq.app',
    title: 'IELTS MCQ Practice | Master Your IELTS Exam',
    description:
      'Practice IELTS with our comprehensive MCQ platform. Features real-time scoring, AI-powered insights, and detailed progress tracking.',
    siteName: 'IELTS MCQ Practice',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IELTS MCQ Practice',
    description: 'Master your IELTS exam with AI-powered practice tests',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

/**
 * Viewport Configuration
 * Mobile-optimized settings
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

/**
 * Root Layout Component
 * Wraps all pages with providers and global styles
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {/* Main content */}
          {children}
          
          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                color: 'rgb(var(--foreground))',
                boxShadow: 'var(--glass-shadow)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
