import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type PreviewMode = "onboarding" | "signed";

const STORAGE_KEY = "partner-preview-mode";

const PreviewModeContext = createContext<{
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  togglePreviewMode: () => void;
} | null>(null);

export function PreviewModeProvider({ children }: { children: React.ReactNode }) {
  const [previewMode, setPreviewModeState] = useState<PreviewMode>("onboarding");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PreviewMode | null;
    if (stored === "onboarding" || stored === "signed") {
      setPreviewModeState(stored);
    }
  }, []);

  const setPreviewMode = useCallback((mode: PreviewMode) => {
    setPreviewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const togglePreviewMode = useCallback(() => {
    setPreviewModeState((prev) => {
      const next = prev === "onboarding" ? "signed" : "onboarding";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <PreviewModeContext.Provider value={{ previewMode, setPreviewMode, togglePreviewMode }}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode() {
  const ctx = useContext(PreviewModeContext);
  if (!ctx) {
    return {
      previewMode: "onboarding" as PreviewMode,
      setPreviewMode: () => {},
      togglePreviewMode: () => {},
    };
  }
  return ctx;
}
