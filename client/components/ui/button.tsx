import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
   'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none cursor-pointer whitespace-nowrap',
   {
      variants: {
         variant: {
            primary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]',
            solid: 'bg-white text-black hover:bg-white/90',
            secondary:
               'bg-[var(--color-surface)] text-white hover:bg-[var(--color-surface-hover)]',
            ghost: 'bg-transparent text-white hover:bg-white/10',
            outline:
               'border border-[var(--color-line)] text-white hover:bg-white/10',
         },
         size: {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-5 text-sm',
            lg: 'h-12 px-7 text-base',
            icon: 'h-10 w-10',
         },
      },
      defaultVariants: {
         variant: 'secondary',
         size: 'md',
      },
   },
);

export interface ButtonProps
   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
      VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
   ({ className, variant, size, ...props }, ref) => (
      <button
         ref={ref}
         className={cn(buttonVariants({ variant, size }), className)}
         {...props}
      />
   ),
);
Button.displayName = 'Button';
