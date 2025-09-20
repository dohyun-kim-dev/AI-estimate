import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
  title: string | undefined;
  setTitle: (title: string | undefined) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

interface HeaderProviderProps {
  children: ReactNode;
}

export const HeaderProvider: React.FC<HeaderProviderProps> = ({ children }) => {
  const [title, setTitle] = useState<string | undefined>(undefined);

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
