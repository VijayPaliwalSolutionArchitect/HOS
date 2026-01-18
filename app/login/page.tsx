import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export const metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <span className="font-bold text-xl text-gradient">IELTS MCQ</span>
        </Link>
      </div>
      <LoginForm />
    </div>
  );
}
