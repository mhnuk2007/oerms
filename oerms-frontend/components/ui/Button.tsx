// components/ui/Button.tsx
"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const baseStyles = `
    relative inline-flex items-center justify-center font-semibold
    rounded-xl transition-all duration-200
    focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
    `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700
      hover:from-blue-700 hover:to-blue-800
      text-white shadow-md hover:shadow-lg
      focus:ring-blue-500
    `,
    secondary: `
      bg-slate-100 hover:bg-slate-200
      text-slate-900 border border-slate-300
      focus:ring-slate-500
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 hover:bg-blue-50
      focus:ring-blue-500
    `,
    ghost: `
      bg-transparent hover:bg-slate-100
      text-slate-700 hover:text-slate-900
      focus:ring-slate-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      text-white shadow-md hover:shadow-lg
      focus:ring-red-500
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700
      hover:from-green-700 hover:to-green-800
      text-white shadow-md hover:shadow-lg
      focus:ring-green-500
    `,
    gradient: `
      bg-gradient-to-r from-purple-600 via-pink-600 to-red-600
      hover:from-purple-700 hover:via-pink-700 hover:to-red-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-purple-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${shouldReduceMotion ? '' : 'hover:scale-105'} `}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
