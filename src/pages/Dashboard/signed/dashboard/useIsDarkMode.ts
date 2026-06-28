import { useEffect, useState } from "react";

/**
 * Tracks the presence of the `dark` class on <html> so that imperative
 * libraries (ApexCharts) can re-render with theme-aware colors.
 */
export function useIsDarkMode(): boolean {
  const getInitial = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const [isDark, setIsDark] = useState<boolean>(getInitial);

  useEffect(() => {
    const root = document.documentElement;

    const update = () => setIsDark(root.classList.contains("dark"));
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
