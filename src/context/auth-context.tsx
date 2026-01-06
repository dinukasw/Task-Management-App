"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import type { LoginInput, RegisterInput } from "@/validators/auth.schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (credentials: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginInput): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // Handle network errors or non-OK responses before parsing JSON
      if (!response.ok) {
        // Try to parse error response, but handle JSON parse failures
        let errorMessage = "Login failed. Please try again.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status-based messages
          if (response.status === 401) {
            errorMessage = "Invalid email or password";
          } else if (response.status === 400) {
            errorMessage = "Invalid input data. Please check your email and password.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return {
          success: false,
          error: "Invalid response from server. Please try again.",
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || "Login failed",
        };
      }

      // Update user state
      setUser(data.user);
      return { success: true };
    } catch (error) {
      // Handle network errors, timeouts, and other fetch failures
      let errorMessage = "Unable to connect to server. Please check your internet connection.";
      
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error instanceof Error) {
        // Check for timeout or other specific errors
        if (error.name === "AbortError" || error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (data: RegisterInput): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Handle network errors or non-OK responses before parsing JSON
      if (!response.ok) {
        // Try to parse error response, but handle JSON parse failures
        let errorMessage = "Registration failed. Please try again.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status-based messages
          if (response.status === 409) {
            errorMessage = "User with this email already exists";
          } else if (response.status === 400) {
            errorMessage = "Invalid input data. Please check your information.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Parse successful response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        return {
          success: false,
          error: "Invalid response from server. Please try again.",
        };
      }

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Registration failed",
        };
      }

      // Update user state
      setUser(result.user);
      return { success: true };
    } catch (error) {
      // Handle network errors, timeouts, and other fetch failures
      let errorMessage = "Unable to connect to server. Please check your internet connection.";
      
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error instanceof Error) {
        // Check for timeout or other specific errors
        if (error.name === "AbortError" || error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticating,
      login, 
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

