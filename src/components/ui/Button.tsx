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
    // Bright orange clears AA only as "large text", so its background is applied
    // per-size below (primaryBg) rather than hard-coded here.
    primary: 'text-cream hover:opacity-90 shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-charcoal text-cream hover:bg-charcoal/90 shadow-md',
    // Hover fills with brand-dark (AA-legible at any size) instead of bright brand.
    outline: 'border-2 border-brand text-green hover:bg-brand-dark hover:text-cream',
    ghost: 'text-green hover:bg-brand/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm font-semibold',
    md: 'px-6 py-3 text-base font-semibold',
    // lg is the CTA size: cream-on-orange needs "large text" (≥18.66px bold) to clear AA 3:1.
    lg: 'px-10 py-4 text-[19px] font-bold',
  };

  // Filled primary uses bright orange only at lg (large-text AA). Smaller sizes
  // fall back to brand-dark, which keeps cream text AA-legible at any size — so the
  // component can't accidentally ship a low-contrast button.
  const primaryBg =
    variant === 'primary' ? (size === 'lg' ? 'bg-brand' : 'bg-brand-dark') : '';

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
