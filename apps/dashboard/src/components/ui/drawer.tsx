import { X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';
export type DrawerPlacement = 'right' | 'left';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerBadge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: DrawerSize;
  placement?: DrawerPlacement;
  closeDisabled?: boolean;
  closeOnOverlayClick?: boolean;
  zIndexClassName?: string;
  className?: string;
  bodyClassName?: string;
}

const SIZE_CLASSES: Record<DrawerSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
};

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  headerBadge,
  children,
  footer,
  size = 'lg',
  placement = 'right',
  closeDisabled = false,
  closeOnOverlayClick = true,
  zIndexClassName = 'z-50',
  className,
  bodyClassName,
}: DrawerProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      setMounted(true);
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      timer = setTimeout(() => {
        setMounted(false);
      }, 300);
    }

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !closeDisabled) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeDisabled, onClose]);

  if (!mounted) return null;

  const isRight = placement === 'right';
  const hiddenTranslate = isRight ? 'translate-x-full' : '-translate-x-full';

  const content = (
    <div
      className={cn(
        'fixed inset-0 flex overflow-hidden',
        isRight ? 'justify-end' : 'justify-start',
        zIndexClassName,
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Smooth Backdrop Overlay */}
      <div
        onClick={() => {
          if (closeOnOverlayClick && !closeDisabled) {
            onClose();
          }
        }}
        className={cn(
          'fixed inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Smooth Slide-over Drawer Panel */}
      <div
        className={cn(
          'relative z-10 flex h-full w-full flex-col border-border bg-card shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isRight ? 'border-l' : 'border-r',
          SIZE_CLASSES[size],
          visible ? 'translate-x-0' : hiddenTranslate,
          className,
        )}
      >
        {/* Drawer Header */}
        {(title || subtitle || headerBadge) && (
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-card px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {title && (
                  <h3 className="font-display text-base font-bold text-foreground">
                    {title}
                  </h3>
                )}
                {headerBadge}
              </div>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={closeDisabled}
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Drawer Body */}
        <div
          className={cn(
            'flex-1 overflow-y-auto px-5 py-5',
            bodyClassName,
          )}
        >
          {children}
        </div>

        {/* Drawer Footer */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-border bg-card px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
}

