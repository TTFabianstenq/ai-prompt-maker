import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'border-transparent bg-primary text-primary-foreground': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'text-foreground': variant === 'outline',
          'border-transparent bg-emerald-600/20 text-emerald-400': variant === 'success',
        },
        className
      )}
      {...props}
    />
  );
}