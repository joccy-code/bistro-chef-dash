import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

interface Admin {
  id: number;
  username: string;
  email?: string;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  admin?: Admin;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally, verify token with backend and fetch admin info
      setAdmin({ id: 0, username: "Admin" }); // temporary placeholder
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response: LoginResponse = await api.login({ username, password });
    if (!response.success) throw new Error(response.message || "Login failed");

    if (response.token) localStorage.setItem("token", response.token);
    setAdmin(response.admin || null);
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("token");
    api.logout?.(); // optional backend logout
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
