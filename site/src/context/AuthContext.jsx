import { createContext, useState, useEffect, useCallback, } from "react";
import { authApi } from "../api/modules/auth.api";

export const AuthContext = createContext(null);

const TOKEN_KEY = "access_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  // Check whether the existing session is valid
  const checkSession = useCallback(async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      setStatus("guest");
      return false;
    }

    try {
      const response = await authApi.me();

      setUser(response.data);
      setStatus("authenticated");

      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setStatus("guest");
      } else {
        setStatus((previous) =>
          previous === "authenticated"
            ? previous
            : "error"
        );
      }

      return false;
    }
  }, []);

  // Restore and monitor the session
  useEffect(() => {
    checkSession();

    const onFocus = () => {
      checkSession();
    };

    window.addEventListener("focus", onFocus);

    const interval = setInterval(
      checkSession,
      5 * 60 * 1000
    );

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [checkSession]);

  // Login
  
const login = async (credentials) => {
  try {
    const response = await authApi.login(credentials);

    const { token, type, role, studentNumber } = response.data;

    if (!token) {
      throw new Error("Login response missing JWT");
    }

    // Save authentication token
    sessionStorage.setItem(TOKEN_KEY, token);

    // Save user details in React Context
    setUser({
      role,
      studentNumber
    });

    // Update authentication state
    setStatus("authenticated");

    return true;

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };


  // Logout
  const logout = async () => {
    try {
      if (typeof authApi.logout === "function") {
        await authApi.logout();
      }
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setStatus("guest");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
