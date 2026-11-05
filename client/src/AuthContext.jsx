import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "./api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    apiRequest("/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error) => {
        if (error.status !== 401) {
          setAuthError(error.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, authError, setAuthError }),
    [user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
