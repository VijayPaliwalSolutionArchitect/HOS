'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-xl bg-muted', className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', theme === 'light' && 'bg-background shadow')}
        onClick={() => setTheme('light')}
      >
        <Sun className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', theme === 'dark' && 'bg-background shadow')}
        onClick={() => setTheme('dark')}
      >
        <Moon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', theme === 'system' && 'bg-background shadow')}
        onClick={() => setTheme('system')}
      >
        <Monitor className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default ThemeToggle;
