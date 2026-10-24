"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Modal built on the native <dialog> + showModal(): the page behind becomes inert,
 * focus is trapped inside, Escape closes, and focus returns to whatever opened it.
 * Bottom sheet on phones, centred card from `sm` up.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      d.showModal();
      // React's autoFocus doesn't survive showModal(); honour data-autofocus instead of landing on the close button.
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && d.open) {
      d.close();
      returnTo.current?.focus?.();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="tf-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {open && (
        <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
          <div className="anim-scrim absolute inset-0 bg-scrim" onClick={onClose} aria-hidden />
          <div
            className={cn(
              "anim-dialog is-sheet relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl bg-surface shadow-pop sm:max-w-md sm:rounded-xl",
              "pb-[env(safe-area-inset-bottom)] sm:pb-0",
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="min-w-0">
                <h2 id={titleId} className="type-title text-text">
                  {title}
                </h2>
                {description && (
                  <div id={descId} className="mt-1.5 text-sm text-text-2">
                    {description}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mt-1.5 -mr-2 flex size-9 shrink-0 items-center justify-center rounded-md text-text-2 hover:bg-bg-hover hover:text-text"
              >
                <X />
              </button>
            </div>
            {children && <div className="overflow-y-auto overscroll-contain px-5 pt-4 pb-1 sm:px-6">{children}</div>}
            {footer ? (
              <div className="mt-5 flex flex-col-reverse gap-2 border-t border-line bg-bg-2 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>
            ) : (
              <div className="h-5 sm:h-6" />
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
