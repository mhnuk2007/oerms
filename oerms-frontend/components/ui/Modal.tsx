"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle2, Info, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

// ============================================
// Modal / Dialog Component
// Sizes: sm (400px), md (600px), lg (800px)
// Accessible: role="dialog", aria-modal, ESC/overlay close, focus trap
// ============================================

export type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  showClose?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  closeOnOverlay?: boolean;
}

function usePortal(id: string) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("id", id);
      document.body.appendChild(el);
    }
    rootRef.current = el as HTMLElement;
    return () => {
      // Do not remove to avoid portal churn across pages
    };
  }, [id]);

  return rootRef;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  showClose = true,
  footer,
  children,
  closeOnOverlay = true,
}: ModalProps) {
  const portalRef = usePortal("modal-root");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<Element | null>(null);

  // Focus management
  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement;
      // Slight delay to ensure the element exists
      setTimeout(() => {
        dialogRef.current?.focus();
      }, 0);
    } else {
      if (lastFocusedRef.current instanceof HTMLElement) {
        lastFocusedRef.current.focus();
      }
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Basic focus trap within modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: FocusEvent) => {
      if (!dialogRef.current) return;
      if (dialogRef.current.contains(e.target as Node)) return;
      // Redirect focus back inside
      e.stopPropagation();
      dialogRef.current.focus();
    };
    document.addEventListener("focus", handler, true);
    return () => document.removeEventListener("focus", handler, true);
  }, [open]);

  if (!portalRef.current) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  }[size];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
            onClick={() => closeOnOverlay && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              aria-describedby={description ? "modal-desc" : undefined}
              tabIndex={-1}
              ref={dialogRef}
              className={`w-full ${sizeClass} max-h-[85vh] overflow-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    {title && (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
                    )}
                    {description && (
                      <p id="modal-desc" className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
                    )}
                  </div>
                  {showClose && (
                    <button
                      aria-label="Close modal"
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-ring"
                      onClick={onClose}
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-5">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-5 pt-0 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRef.current
  );
}

// ============================================
// Alert / Notice Component
// Variants: info, success, warning, danger
// ============================================

type AlertVariant = "info" | "success" | "warning" | "danger";

export function Alert({
  title,
  description,
  variant = "info",
  className = "",
  actions,
}: {
  title: string;
  description?: string | React.ReactNode;
  variant?: AlertVariant;
  className?: string;
  actions?: React.ReactNode;
}) {
  const colors = {
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/15",
      border: "border-blue-200 dark:border-blue-800/40",
      text: "text-blue-800 dark:text-blue-200",
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-900/15",
      border: "border-emerald-200 dark:border-emerald-800/40",
      text: "text-emerald-800 dark:text-emerald-200",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/15",
      border: "border-amber-200 dark:border-amber-800/40",
      text: "text-amber-800 dark:text-amber-200",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    },
    danger: {
      bg: "bg-red-50 dark:bg-red-900/15",
      border: "border-red-200 dark:border-red-800/40",
      text: "text-red-800 dark:text-red-200",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    },
  } as const;

  const c = colors[variant];

  return (
    <div className={`p-4 rounded-lg border ${c.bg} ${c.border} ${className}`} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        {c.icon}
        <div className="flex-1">
          <p className={`font-medium ${c.text}`}>{title}</p>
          {description && (
            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{description}</div>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}

// ============================================
// Progress Bar Component
// Variants: determinate with percentage, indeterminate
// ============================================

export function ProgressBar({ value, indeterminate = false, className = "" }: { value?: number; indeterminate?: boolean; className?: string; }) {
  return (
    <div className={`progress-bar ${className}`} aria-label="progress" aria-valuenow={indeterminate ? undefined : value} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <div
        className={`progress-bar-fill ${indeterminate ? "progress-bar-animated" : ""}`}
        style={!indeterminate ? { width: `${Math.min(100, Math.max(0, value ?? 0))}%` } : undefined}
      />
    </div>
  );
}

// ============================================
// Auto-save Indicator (Saving / Saved / Error)
// ============================================

type SaveState = "idle" | "saving" | "saved" | "error";

export function AutoSaveIndicator({ state = "idle", message }: { state?: SaveState; message?: string; }) {
  const map = {
    idle: { text: "Idle", className: "" },
    saving: { text: "Saving...", className: "saving" },
    saved: { text: "Saved", className: "saved" },
    error: { text: "Error", className: "text-red-500" },
  } as const;

  const label = message ?? map[state].text;

  return (
    <div className={`auto-save-indicator ${map[state].className}`} aria-live="polite">
      <span className="auto-save-dot" />
      <span>{label}</span>
    </div>
  );
}
