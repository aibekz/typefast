"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type AuthState,
  getStoredToken,
  getStoredUserInfo,
  initiateLogin,
  logout,
  storeAuthData,
  validateToken,
} from "../../lib/auth";
import {
  createRetypeUser,
  getRetypeUserByNvixioId,
  updateRetypeUser,
} from "../../lib/database";

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    const storedUserInfo = getStoredUserInfo();


    if (!token) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    try {
      // Validate token with auth service
      const userInfo = await validateToken(token);

      // Store/update Retype user profile (linked to NVIXIO user)
      try {
        // Extract NVIXIO user ID from JWT token (assuming it's in the token)
        const nvixioUserId = userInfo.id || userInfo.email; // Use email as fallback for NVIXIO user ID

        const existingRetypeUser =
          await getRetypeUserByNvixioId(nvixioUserId);
        if (existingRetypeUser) {
          // Update existing Retype user profile
          await updateRetypeUser(nvixioUserId, {
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.avatar,
          });
        } else {
          // Create new Retype user profile
          await createRetypeUser({
            authId: nvixioUserId,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.avatar,
          });
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue with auth even if DB fails
      }

      setAuthState({
        user: userInfo,
        isLoading: false,
        isAuthenticated: true,
      });

      // Update stored user info
      storeAuthData(token, userInfo);
    } catch (error) {
      console.error("Token validation failed:", error);

      // Clear invalid auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const handleLogin = useCallback(() => {
    // Redirect directly to auth service
    initiateLogin();
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    refreshUser();

    // Listen for successful login events
    const handleLoginSuccess = () => {
      refreshUser();
    };

    window.addEventListener("authLoginSuccess", handleLoginSuccess);

    return () => {
      window.removeEventListener("authLoginSuccess", handleLoginSuccess);
    };
  }, [refreshUser]);

  // Handle login callback
  useEffect(() => {
    const handleLoginCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      if (token && state && !error) {
        try {
          const userInfo = await validateToken(token);
          storeAuthData(token, userInfo);

          setAuthState({
            user: userInfo,
            isLoading: false,
            isAuthenticated: true,
          });

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } catch (error) {
          console.error("Login callback failed:", error);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    // Check if this is a login callback
    if (window.location.pathname === "/auth/callback") {
      handleLoginCallback();
    }
  }, []);

  const value: AuthContextType = {
    ...authState,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
