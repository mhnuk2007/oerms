"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

/**
 * AlertBridge intercepts window.alert calls and routes them to the Toast system.
 * This upgrades legacy alert-based UX across all pages without editing each page.
 */
export function AlertBridge() {
  const { addToast } = useToast();
  const originalAlertRef = useRef<typeof window.alert | null>(null);

  useEffect(() => {
    // Preserve original alert so we can restore on unmount
    if (!originalAlertRef.current) {
      originalAlertRef.current = window.alert.bind(window);
    }

    const patchedAlert = (message?: any) => {
      const text = typeof message === "string" ? message : String(message);
      addToast(text, "info");
    };

    window.alert = patchedAlert as any;

    return () => {
      if (originalAlertRef.current) {
        window.alert = originalAlertRef.current as any;
      }
    };
  }, [addToast]);

  return null;
}
