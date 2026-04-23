import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PartnerStaffChatContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const PartnerStaffChatContext =
  createContext<PartnerStaffChatContextValue | null>(null);

export function PartnerStaffChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <PartnerStaffChatContext.Provider value={value}>
      {children}
    </PartnerStaffChatContext.Provider>
  );
}

export function usePartnerStaffChat(): PartnerStaffChatContextValue {
  const ctx = useContext(PartnerStaffChatContext);
  if (!ctx) {
    throw new Error(
      "usePartnerStaffChat must be used within PartnerStaffChatProvider",
    );
  }
  return ctx;
}
