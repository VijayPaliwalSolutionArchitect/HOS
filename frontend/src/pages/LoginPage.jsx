import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GlassCard } from '../components/ui/card';
import { useAuthStore } from '../store';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Welcome back!');
      // Redirect based on role
      const roleRedirects = {
        STUDENT: '/student/dashboard',
        TEACHER: '/manager/dashboard',
        MANAGER: '/manager/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(roleRedirects[result.user.role] || '/student/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleDemoLogin = async (role) => {
    const credentials = {
      STUDENT: { email: 'student@eduexam.com', password: 'student123' },
      MANAGER: { email: 'manager@eduexam.com', password: 'manager123' },
      ADMIN: { email: 'admin@eduexam.com', password: 'admin123' },
    };
    
    setFormData(credentials[role]);
    const result = await login(credentials[role].email, credentials[role].password);
    
    if (result.success) {
      toast.success(`Logged in as ${role}`);
      const roleRedirects = {
        STUDENT: '/student/dashboard',
        MANAGER: '/manager/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(roleRedirects[role]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-pattern p-4">
      {/* Background Effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your learning journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-submit-btn">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-4">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('STUDENT')}
                disabled={isLoading}
                data-testid="demo-student-btn"
              >
                Student
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('MANAGER')}
                disabled={isLoading}
                data-testid="demo-manager-btn"
              >
                Manager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
                data-testid="demo-admin-btn"
              >
                Admin
              </Button>
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LoginPage;
