import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE_KEY = "poly-market-clone:userId";

type AuthContextValue = {
  userId: string | null;
  login: (userId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  const login = (nextUserId: string) => {
    localStorage.setItem(STORAGE_KEY, nextUserId);
    setUserId(nextUserId);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
