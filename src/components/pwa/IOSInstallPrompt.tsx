"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * iOS Safari "Add to Home Screen" Install Prompt
 *
 * TODO: Revisit this component for improvements:
 * - Add animation/transitions (framer-motion)
 * - Better dismiss persistence (currently uses localStorage, consider expiry)
 * - A/B test different messaging/positioning
 * - Add analytics tracking for prompt shown/dismissed/installed
 * - Consider showing after user engagement (not immediately)
 * - Add illustration or app icon preview
 */

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if already dismissed
    const dismissed = localStorage.getItem("ios-install-prompt-dismissed");
    if (dismissed) return;

    // Detect iOS Safari (not in standalone mode)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    if (isIOS && isSafari && !isStandalone) {
      // Small delay so it doesn't flash immediately on load
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("ios-install-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="mx-auto max-w-md rounded-xl bg-card shadow-lg border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold text-card-foreground">Install YM App</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add to your home screen for the best experience
            </p>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <span>Tap</span>
              <Share className="h-4 w-4" />
              <span>then</span>
              <PlusSquare className="h-4 w-4" />
              <span>&quot;Add to Home Screen&quot;</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
