"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UploadContextType {
  uploadingCount: number;
  setUploadingCount: (count: number) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadingCount, setUploadingCount] = useState(0);

  return (
    <UploadContext.Provider value={{ uploadingCount, setUploadingCount }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);

  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider");
  }

  return context;
}
