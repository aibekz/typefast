import { nanoid } from "nanoid";

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://auth.nvix.io" 
    : "http://localhost:3000");
const APP_NAME = "retype";

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  tenant: string;
  role: string;
  plan: string;
  status: string;
}

export interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Generate CSRF token for login flow
 */
export function generateCSRFToken(): string {
  return nanoid(32);
}

/**
 * Initiate login flow with auth.nvix.io (Direct OAuth)
 */
export function initiateLogin(): void {
  const csrfToken = generateCSRFToken();
  const redirectUri = `${window.location.origin}/auth/callback`;

  // Store CSRF token for validation
  sessionStorage.setItem("auth_csrf_token", csrfToken);

  // Build direct OAuth URL (skips login page, goes straight to Google)
  const loginUrl = new URL(`${AUTH_SERVICE_URL}/api/auth/login`);
  loginUrl.searchParams.set("app", APP_NAME);
  loginUrl.searchParams.set("redirect_uri", redirectUri);
  loginUrl.searchParams.set("state", csrfToken);
  loginUrl.searchParams.set("direct", "true"); // Enable direct OAuth

  // Redirect directly to Google OAuth
  window.location.href = loginUrl.toString();
}

/**
 * Get cookie value by name
 */
function _getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Handle login callback from auth.nvix.io
 * Uses secure OAuth 2.0 authorization code flow
 */
export async function handleLoginCallback(): Promise<{
  token: string | null;
  error: string | null;
}> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const error = urlParams.get("error");

  // Check for errors
  if (error) {
    return { token: null, error };
  }

  // Validate CSRF token
  const storedCSRF = sessionStorage.getItem("auth_csrf_token");
  if (!state || !storedCSRF || state !== storedCSRF) {
    return { token: null, error: "Invalid CSRF token" };
  }

  // Check for authorization code
  if (!code) {
    return { token: null, error: "No authorization code received" };
  }

  // Clean up CSRF token
  sessionStorage.removeItem("auth_csrf_token");

  try {
    // Exchange authorization code for JWT token
    const response = await fetch("/api/auth/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        app: APP_NAME,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        token: null,
        error: errorData.error || "Failed to exchange authorization code",
      };
    }

    const data = await response.json();
    return { token: data.token, error: null };
  } catch (error) {
    console.error("Failed to exchange authorization code:", error);
    return { token: null, error: "Network error during token exchange" };
  }
}

/**
 * Validate JWT token with auth service
 */
export async function validateToken(token: string): Promise<UserInfo> {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });


    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(
        errorData.error || "Token validation failed",
        "VALIDATION_FAILED",
      );
    }

    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      "Network error during token validation",
      "NETWORK_ERROR",
    );
  }
}

/**
 * Logout user
 */
export function logout(): void {
  // Clear local storage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_info");

  // Clear session storage
  sessionStorage.removeItem("auth_csrf_token");

  // Redirect to home
  window.location.href = "/";
}

/**
 * Get stored token from localStorage
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Store token and user info
 */
export function storeAuthData(token: string, userInfo: UserInfo): void {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("user_info", JSON.stringify(userInfo));
}

/**
 * Get stored user info
 */
export function getStoredUserInfo(): UserInfo | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("user_info");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  const userInfo = getStoredUserInfo();
  return !!(token && userInfo);
}
