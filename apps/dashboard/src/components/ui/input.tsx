import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs outline-none transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600/70 focus:outline-none focus:ring-2 focus:ring-teal-500/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-zinc-700 dark:bg-zinc-900/90 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-primary/70 dark:focus:ring-primary/15 dark:disabled:border-zinc-800 dark:disabled:bg-zinc-800/60 dark:disabled:text-zinc-500',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
