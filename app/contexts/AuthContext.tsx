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

// Cookie helper functions
const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document !== "undefined" && "cookieStore" in document) {
    // Use Cookie Store API if available
    (document as any).cookieStore.set(name, value, {
      maxAge,
      path: "/",
      secure: true,
      sameSite: "strict",
    });
  } else {
    // Fallback to direct assignment
    // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; secure; samesite=strict`;
  }
};

const deleteCookie = (name: string) => {
  if (typeof document !== "undefined" && "cookieStore" in document) {
    // Use Cookie Store API if available
    (document as any).cookieStore.delete(name, { path: "/" });
  } else {
    // Fallback to direct assignment
    // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

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
    const _storedUserInfo = getStoredUserInfo();

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
      let databaseUserId = null;
      try {
        // Extract NVIXIO user ID from JWT token (assuming it's in the token)
        const nvixioUserId = userInfo.id || userInfo.email; // Use email as fallback for NVIXIO user ID

        const existingRetypeUser = await getRetypeUserByNvixioId(nvixioUserId);
        if (existingRetypeUser) {
          // Update existing Retype user profile
          await updateRetypeUser(nvixioUserId, {
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.avatar,
          });
          databaseUserId = existingRetypeUser.id;
        } else {
          // Create new Retype user profile
          const newUser = await createRetypeUser({
            authId: nvixioUserId,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.avatar,
          });
          databaseUserId = newUser.id;
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue with auth even if DB fails
      }

      setAuthState({
        user: {
          ...userInfo,
          id: databaseUserId, // Use database user ID for API calls
        },
        isLoading: false,
        isAuthenticated: true,
      });

      // Update stored user info
      storeAuthData(token, userInfo);

      // Also set cookie for API routes that expect cookies
      setCookie("auth_token", token, 7 * 24 * 60 * 60);
    } catch (error) {
      console.error("Token validation failed:", error);

      // Clear invalid auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");

      // Clear cookies
      deleteCookie("auth_token");

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

    // Clear cookies
    deleteCookie("auth_token");

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

          // Get database user ID
          let databaseUserId = null;
          try {
            const nvixioUserId = userInfo.id || userInfo.email;
            const existingRetypeUser =
              await getRetypeUserByNvixioId(nvixioUserId);
            if (existingRetypeUser) {
              databaseUserId = existingRetypeUser.id;
            } else {
              const newUser = await createRetypeUser({
                authId: nvixioUserId,
                email: userInfo.email,
                name: userInfo.name,
                avatar: userInfo.avatar,
              });
              databaseUserId = newUser.id;
            }
          } catch (dbError) {
            console.error("Database error in callback:", dbError);
          }

          setAuthState({
            user: {
              ...userInfo,
              id: databaseUserId,
            },
            isLoading: false,
            isAuthenticated: true,
          });

          // Also set cookie for API routes that expect cookies
          setCookie("auth_token", token, 7 * 24 * 60 * 60);

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
