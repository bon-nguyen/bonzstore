import { Check, ChevronDown, Pencil, Plus, Search } from 'lucide-react';
import {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '../../lib/utils';

interface BaseFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
}

const BASE_CONTROL_STYLE =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-foreground shadow-2xs outline-none transition-all duration-150 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/15 focus-visible:outline-none dark:border-zinc-700 dark:bg-zinc-900/90 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-primary/70 dark:focus:bg-zinc-900 dark:focus:ring-primary/15';

const DISABLED_CONTROL_STYLE =
  'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-200 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-500 dark:hover:border-zinc-800';

const ERROR_CONTROL_STYLE =
  'border-red-500 focus:border-red-500 focus:ring-red-500/15 dark:border-red-500/80 dark:focus:border-red-500';

export interface RHFInputProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues>,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'defaultValue'> {
  inputClassName?: string;
  leftIcon?: ReactNode;
  rightAddon?: ReactNode;
}

export function RHFInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  hint,
  className,
  inputClassName,
  leftIcon,
  rightAddon,
  disabled,
  ...rest
}: RHFInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('space-y-1.5', className)}>
          {label && (
            <label className="block text-xs font-semibold text-foreground">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <div className="relative flex items-center">
            {leftIcon && (
              <div className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center text-slate-400 dark:text-zinc-500">
                {leftIcon}
              </div>
            )}
            <input
              {...rest}
              {...field}
              value={field.value ?? ''}
              disabled={disabled}
              className={cn(
                BASE_CONTROL_STYLE,
                'h-9',
                leftIcon && 'pl-9',
                rightAddon && 'pr-10',
                disabled && DISABLED_CONTROL_STYLE,
                error && ERROR_CONTROL_STYLE,
                inputClassName,
              )}
            />
            {rightAddon && (
              <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
                {rightAddon}
              </div>
            )}
          </div>
          {hint && !error && (
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          )}
          {error?.message && (
            <p className="text-[11px] font-medium text-red-500">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

export interface RHFTextareaProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues>,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'defaultValue'> {
  textareaClassName?: string;
}

export function RHFTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  hint,
  className,
  textareaClassName,
  disabled,
  rows = 3,
  ...rest
}: RHFTextareaProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('space-y-1.5', className)}>
          {label && (
            <label className="block text-xs font-semibold text-foreground">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <textarea
            {...rest}
            {...field}
            rows={rows}
            value={field.value ?? ''}
            disabled={disabled}
            className={cn(
              BASE_CONTROL_STYLE,
              'resize-none py-2',
              disabled && DISABLED_CONTROL_STYLE,
              error && ERROR_CONTROL_STYLE,
              textareaClassName,
            )}
          />
          {hint && !error && (
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          )}
          {error?.message && (
            <p className="text-[11px] font-medium text-red-500">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

export interface RHFCurrencyInputProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  allowZeroDisplay?: boolean;
  leftIcon?: ReactNode;
  rightAddon?: ReactNode;
}

export function RHFCurrencyInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  hint,
  className,
  labelClassName,
  inputClassName,
  placeholder = '0',
  disabled,
  min = 0,
  max,
  allowZeroDisplay = false,
  leftIcon,
  rightAddon,
}: RHFCurrencyInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const numericVal = Number(field.value || 0);
        const displayValue =
          numericVal > 0
            ? numericVal.toLocaleString('vi-VN')
            : allowZeroDisplay && numericVal === 0
              ? '0'
              : '';

        return (
          <div className={cn('space-y-1.5', className)}>
            {label && (
              <label
                className={cn(
                  'block text-xs font-semibold text-foreground',
                  labelClassName,
                )}
              >
                {label} {required && <span className="text-red-500">*</span>}
              </label>
            )}
            <div className="relative flex items-center">
              {leftIcon && (
                <div className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center text-slate-400 dark:text-zinc-500">
                  {leftIcon}
                </div>
              )}
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                disabled={disabled}
                placeholder={placeholder}
                value={displayValue}
                onChange={(e) => {
                  const rawDigits = e.target.value.replace(/[^\d]/g, '');
                  if (!rawDigits) {
                    field.onChange(min > 0 ? min : 0);
                    return;
                  }
                  let next = Number(rawDigits);
                  if (typeof min === 'number' && next < min) next = min;
                  if (typeof max === 'number' && next > max) next = max;
                  field.onChange(next);
                }}
                onBlur={field.onBlur}
                className={cn(
                  BASE_CONTROL_STYLE,
                  'h-9 font-mono text-xs font-bold',
                  leftIcon && 'pl-9',
                  rightAddon && 'pr-16',
                  disabled && DISABLED_CONTROL_STYLE,
                  error && ERROR_CONTROL_STYLE,
                  inputClassName,
                )}
              />
              {rightAddon && (
                <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
                  {rightAddon}
                </div>
              )}
            </div>
            {hint && !error && (
              <p className="text-[10px] text-muted-foreground">{hint}</p>
            )}
            {error?.message && (
              <p className="text-[10px] font-medium text-red-500">
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}

export interface RHFCheckboxProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  description?: ReactNode;
  disabled?: boolean;
}

export function RHFCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: RHFCheckboxProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label
          className={cn(
            'flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-300 bg-slate-50/70 p-3 transition-colors hover:border-slate-400 hover:bg-slate-100/70 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/60',
            disabled && 'cursor-not-allowed opacity-60',
            className,
          )}
        >
          <input
            type="checkbox"
            checked={Boolean(field.value)}
            disabled={disabled}
            onChange={(e) => field.onChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-0 focus:ring-offset-0 dark:border-zinc-600"
          />
          <div className="space-y-0.5">
            {label && (
              <span className="block text-xs font-semibold text-foreground">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-[11px] text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        </label>
      )}
    />
  );
}

export interface CreatableSelectOption<TMeta = any> {
  value: string;
  label: string;
  code?: string;
  description?: string;
  badge?: string;
  avatarUrl?: string;
  meta?: TMeta;
}

export interface RHFCreatableSelectProps<
  TFieldValues extends FieldValues,
  TMeta = any,
> extends BaseFieldProps<TFieldValues> {
  options: CreatableSelectOption<TMeta>[];
  placeholder?: string;
  disabledPlaceholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  dropdownPlacement?: 'bottom' | 'top' | 'auto';
  onCreateNew?: () => void;
  createNewLabel?: string;
  showInlineCreateButton?: boolean;
  inlineCreateTooltip?: string;
  leftIcon?: ReactNode;
  onEditOption?: (option: CreatableSelectOption<TMeta>) => void;
  editOptionTooltip?: string;
  onValueSelect?: (
    value: string,
    option?: CreatableSelectOption<TMeta>,
  ) => void;
}

export function RHFCreatableSelect<
  TFieldValues extends FieldValues,
  TMeta = any,
>({
  control,
  name,
  label,
  required,
  hint,
  className,
  options,
  placeholder = 'Chọn...',
  disabledPlaceholder,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  disabled = false,
  searchable = true,
  dropdownPlacement = 'auto',
  onCreateNew,
  createNewLabel = 'Tạo mới',
  showInlineCreateButton = false,
  inlineCreateTooltip = 'Thêm mới',
  leftIcon,
  onEditOption,
  editOptionTooltip = 'Chỉnh sửa',
  onValueSelect,
}: RHFCreatableSelectProps<TFieldValues, TMeta>) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.code && opt.code.toLowerCase().includes(q)) ||
        (opt.description && opt.description.toLowerCase().includes(q)),
    );
  }, [options, searchQuery]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const selectedOption = options.find((opt) => opt.value === field.value);
        const displayLabel = selectedOption
          ? selectedOption.label
          : field.value
            ? String(field.value)
            : '';

        return (
          <div
            ref={containerRef}
            className={cn('relative space-y-1.5', className)}
          >
            {label && (
              <label className="block text-xs font-semibold text-foreground">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
            )}

            <div className="relative flex items-center">
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    setOpen((prev) => {
                      const nextOpen = !prev;
                      if (nextOpen && containerRef.current) {
                        if (dropdownPlacement === 'top') {
                          setOpenUpward(true);
                        } else if (dropdownPlacement === 'bottom') {
                          setOpenUpward(false);
                        } else {
                          const rect =
                            containerRef.current.getBoundingClientRect();
                          const spaceBelow = window.innerHeight - rect.bottom;
                          setOpenUpward(spaceBelow < 280);
                        }
                      }
                      return nextOpen;
                    });
                  }
                }}
                className={cn(
                  BASE_CONTROL_STYLE,
                  'flex h-9 items-center justify-between gap-2 text-left',
                  showInlineCreateButton && onCreateNew && 'pr-10',
                  open &&
                    !disabled &&
                    'border-teal-600/70 ring-2 ring-teal-500/15 dark:border-primary/70 dark:ring-primary/15',
                  disabled && DISABLED_CONTROL_STYLE,
                  error && ERROR_CONTROL_STYLE,
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
                  {selectedOption?.avatarUrl ? (
                    <img
                      src={selectedOption.avatarUrl}
                      alt={selectedOption.label}
                      className="h-5 w-5 shrink-0 rounded border border-slate-200 bg-white object-contain p-0.5 dark:border-zinc-700"
                    />
                  ) : leftIcon ? (
                    <span className="shrink-0 text-slate-400 dark:text-zinc-500">
                      {leftIcon}
                    </span>
                  ) : null}
                  {selectedOption?.code && (
                    <span className="shrink-0 rounded bg-teal-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-700 dark:bg-primary/20 dark:text-primary">
                      {selectedOption.code}
                    </span>
                  )}
                  {displayLabel ? (
                    <span className="truncate font-semibold text-foreground">
                      {displayLabel}
                    </span>
                  ) : (
                    <span className="truncate font-normal text-slate-400 dark:text-zinc-500">
                      {disabled && disabledPlaceholder
                        ? disabledPlaceholder
                        : placeholder}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
                    open && 'rotate-180',
                  )}
                />
              </button>

              {showInlineCreateButton && onCreateNew && !disabled && (
                <button
                  type="button"
                  title={inlineCreateTooltip || createNewLabel}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onCreateNew();
                  }}
                  className="absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-emerald-600 text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {open && !disabled && (
              <div
                className={cn(
                  'absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-slate-300 bg-card shadow-xl dark:border-zinc-700',
                  openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
                )}
              >
                {searchable && (
                  <div className="border-b border-border bg-muted/20 p-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-2.5 pl-8 text-xs font-medium text-foreground outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-teal-600/70 focus:outline-none focus:ring-2 focus:ring-teal-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-primary/70"
                      />
                    </div>
                  </div>
                )}

                <div className="max-h-56 overflow-y-auto p-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                      Không có kết quả phù hợp
                    </div>
                  ) : (
                    filteredOptions.map((opt) => {
                      const isSelected = field.value === opt.value;
                      return (
                        <div
                          key={opt.value}
                          className={cn(
                            'group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-muted/70',
                            isSelected && 'bg-primary/15 font-semibold',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(opt.value);
                              onValueSelect?.(opt.value, opt);
                              setOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex min-w-0 flex-1 items-start gap-2 text-left"
                          >
                            <Check
                              className={cn(
                                'mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 transition-opacity',
                                isSelected ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {opt.avatarUrl && (
                              <img
                                src={opt.avatarUrl}
                                alt={opt.label}
                                className="mt-0.5 h-6 w-6 shrink-0 rounded border border-slate-200 bg-white object-contain p-0.5 dark:border-zinc-700"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {opt.code && (
                                  <span className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground dark:bg-zinc-800">
                                    {opt.code}
                                  </span>
                                )}
                                <span className="truncate text-foreground">
                                  {opt.label}
                                </span>
                                {opt.badge && (
                                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              {opt.description && (
                                <p className="mt-0.5 line-clamp-1 text-[11px] font-normal text-muted-foreground">
                                  {opt.description}
                                </p>
                              )}
                            </div>
                          </button>

                          {onEditOption && (
                            <button
                              type="button"
                              title={editOptionTooltip}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                                onEditOption(opt);
                              }}
                              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {onCreateNew && (
                  <div className="border-t border-border bg-muted/30 p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setSearchQuery('');
                        onCreateNew();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600/15 px-3 py-2 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-600/25 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{createNewLabel}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {hint && !error && (
              <p className="text-[11px] text-muted-foreground">{hint}</p>
            )}
            {error?.message && (
              <p className="text-[11px] font-medium text-red-500">
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
