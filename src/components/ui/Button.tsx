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
    // Bright signature orange. Cream-on-bright-orange is ~3.4:1, which only clears
    // AA as "large text" — so primary forces ≥19px bold below (primaryBg), and the
    // size token controls padding only.
    primary: 'text-cream hover:opacity-90 shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-charcoal text-cream hover:bg-charcoal/90 shadow-md',
    outline: 'border-2 border-brand text-green hover:bg-brand hover:text-cream',
    ghost: 'text-green hover:bg-brand/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm font-semibold',
    md: 'px-6 py-3 text-base font-semibold',
    lg: 'px-10 py-4 text-[19px] font-bold',
  };

  // Filled primary is ALWAYS the bright signature orange (#D4703A). Bright orange
  // needs large text to clear AA contrast, so primary also forces 19px bold here —
  // this class sits after `sizes`, so it overrides the per-size font and the button
  // stays on-brand and legible at any size. Size only changes padding.
  const primaryBg =
    variant === 'primary' ? 'bg-brand text-[19px] font-bold' : '';

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        primaryBg,
        className
      )}
      {...props}
    />
  );
}
