import { createContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, logout as logoutApi } from "../services/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sih_admin_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("sih_admin_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("sih_admin_user");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token, user: loggedInUser } = await loginApi(email, password);
      localStorage.setItem("sih_admin_token", token);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("sih_admin_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
