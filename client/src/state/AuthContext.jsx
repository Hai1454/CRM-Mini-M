import { createContext, useContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("crm_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;

    http.get("/auth/me")
      .then(({ data }) => {
        localStorage.setItem("crm_user", JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => logout());
  }, []);

  async function login(email, password) {
    const { data } = await http.post("/auth/login", { email, password });
    localStorage.setItem("crm_token", data.token);
    localStorage.setItem("crm_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout, isLoggedIn: Boolean(user) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
