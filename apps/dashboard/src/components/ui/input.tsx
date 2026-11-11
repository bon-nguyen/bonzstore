import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, leftIcon, rightAddon, containerClassName, ...props },
    ref,
  ) => {
    if (leftIcon || rightAddon) {
      return (
        <div className={cn('relative flex items-center', containerClassName)}>
          {leftIcon && (
            <div className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center text-slate-400 dark:text-zinc-500">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs outline-none transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600/70 focus:outline-none focus:ring-2 focus:ring-teal-500/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-zinc-700 dark:bg-zinc-900/90 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-primary/70 dark:focus:ring-primary/15 dark:disabled:border-zinc-800 dark:disabled:bg-zinc-800/60 dark:disabled:text-zinc-500',
              leftIcon && 'pl-9',
              rightAddon && 'pr-10',
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightAddon && (
            <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
              {rightAddon}
            </div>
          )}
        </div>
      );
    }

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

export interface VnNumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  value: number;
  onValueChange: (val: number) => void;
  min?: number;
  max?: number;
  allowZeroDisplay?: boolean;
  leftIcon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export function VnNumberInput({
  value,
  onValueChange,
  min = 0,
  max,
  allowZeroDisplay = false,
  leftIcon,
  rightAddon,
  containerClassName,
  className,
  placeholder = '0',
  disabled,
  ...rest
}: VnNumberInputProps) {
  const [rawText, setRawText] = React.useState<string>(() => {
    const num = Number(value || 0);
    if (num > 0) return num.toLocaleString('vi-VN');
    return allowZeroDisplay ? '0' : '';
  });
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      const num = Number(value || 0);
      if (num > 0) {
        setRawText(num.toLocaleString('vi-VN'));
      } else {
        setRawText(allowZeroDisplay ? '0' : '');
      }
    }
  }, [value, allowZeroDisplay, isFocused]);

  return (
    <Input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      placeholder={placeholder}
      leftIcon={leftIcon}
      rightAddon={rightAddon}
      containerClassName={containerClassName}
      value={rawText}
      onFocus={(e) => {
        setIsFocused(true);
        const num = Number(value || 0);
        setRawText(num > 0 ? String(num) : '');
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        const rawDigits = rawText.replace(/[^\d]/g, '');
        let num = rawDigits ? Number(rawDigits) : 0;
        if (typeof min === 'number' && num < min) num = min;
        if (typeof max === 'number' && num > max) num = max;
        onValueChange(num);
        if (num > 0) {
          setRawText(num.toLocaleString('vi-VN'));
        } else {
          setRawText(allowZeroDisplay ? '0' : '');
        }
        rest.onBlur?.(e);
      }}
      onChange={(e) => {
        const rawDigits = e.target.value.replace(/[^\d]/g, '');
        setRawText(rawDigits);
        const num = rawDigits ? Number(rawDigits) : 0;
        let clamped = num;
        if (typeof max === 'number' && clamped > max) clamped = max;
        onValueChange(clamped);
      }}
      className={cn('font-mono text-right font-semibold', className)}
    />
  );
}

export interface VnCnyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  value: number;
  onValueChange: (val: number) => void;
  min?: number;
  allowZeroDisplay?: boolean;
  leftIcon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export function VnCnyInput({
  value,
  onValueChange,
  min = 0,
  allowZeroDisplay = false,
  leftIcon,
  rightAddon,
  containerClassName,
  className,
  placeholder = '0',
  disabled,
  ...rest
}: VnCnyInputProps) {
  const [rawText, setRawText] = React.useState<string>(() => {
    const num = Number(value || 0);
    if (num > 0) return num.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    return allowZeroDisplay ? '0' : '';
  });
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      const num = Number(value || 0);
      if (num > 0) {
        setRawText(num.toLocaleString('vi-VN', { maximumFractionDigits: 2 }));
      } else {
        setRawText(allowZeroDisplay ? '0' : '');
      }
    }
  }, [value, allowZeroDisplay, isFocused]);

  return (
    <Input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      disabled={disabled}
      placeholder={placeholder}
      leftIcon={leftIcon}
      rightAddon={rightAddon}
      containerClassName={containerClassName}
      value={rawText}
      onFocus={(e) => {
        setIsFocused(true);
        const num = Number(value || 0);
        setRawText(num > 0 ? String(num).replace('.', ',') : '');
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        const num = Number(value || 0);
        if (num > 0) {
          setRawText(num.toLocaleString('vi-VN', { maximumFractionDigits: 2 }));
        } else {
          setRawText(allowZeroDisplay ? '0' : '');
        }
        rest.onBlur?.(e);
      }}
      onChange={(e) => {
        const inputVal = e.target.value;
        // Cho phép nhập số và dấu phẩy hoặc dấu chấm thập phân
        const cleaned = inputVal.replace(/[^\d.,]/g, '');
        setRawText(cleaned);

        let normalized = cleaned;
        if (cleaned.includes(',') && cleaned.includes('.')) {
          normalized = cleaned.replace(/\./g, '').replace(',', '.');
        } else if (cleaned.includes(',')) {
          normalized = cleaned.replace(',', '.');
        } else {
          const parts = cleaned.split('.');
          if (parts.length > 2) {
            normalized = cleaned.replace(/\./g, '');
          }
        }

        const parsed = parseFloat(normalized);
        if (Number.isNaN(parsed)) {
          onValueChange(0);
        } else {
          let clamped = parsed;
          if (typeof min === 'number' && clamped < min) clamped = min;
          onValueChange(clamped);
        }
      }}
      className={cn('font-mono text-right font-semibold', className)}
    />
  );
}

export { Input };
