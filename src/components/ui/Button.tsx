// src/components/ui/Button.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand text-cream hover:bg-brand/90 shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-charcoal text-cream hover:bg-charcoal/90 shadow-md',
    outline: 'border-2 border-brand text-brand hover:bg-brand hover:text-cream',
    ghost: 'text-brand hover:bg-brand/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-4 text-base font-semibold',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
