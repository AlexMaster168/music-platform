import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<
   HTMLInputElement,
   React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
   <input
      ref={ref}
      className={cn(
         'h-11 w-full rounded-lg bg-[var(--color-surface)] px-4 text-sm text-white placeholder:text-[var(--color-muted)] outline-none border border-transparent focus:border-[var(--color-brand)] transition-colors',
         className,
      )}
      {...props}
   />
));
Input.displayName = 'Input';
