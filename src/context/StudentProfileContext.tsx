import React, { createContext, useContext, useState } from "react";

export interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status?: string;
  avatar?: string;
}

const StudentProfileContext = createContext<{
  student: StudentProfileData | null;
  setStudent: (s: StudentProfileData | null) => void;
} | null>(null);

export function StudentProfileProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  return (
    <StudentProfileContext.Provider value={{ student, setStudent }}>
      {children}
    </StudentProfileContext.Provider>
  );
}

export function useStudentProfile() {
  const ctx = useContext(StudentProfileContext);
  return ctx ?? { student: null, setStudent: () => {} };
}
