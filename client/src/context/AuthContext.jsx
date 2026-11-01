// Global login state (user + token) shared by the whole app using React Context.
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check a saved token

  // On first load: if a token is saved, ask the server who the user is
  useEffect(() => {
    const token = localStorage.getItem('findit_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('findit_token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('findit_token', data.token);
    setUser(data.user);
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    saveSession(res.data);
    return res.data.user;
  };

  const register = async (form) => {
    const res = await authService.register(form);
    saveSession(res.data);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('findit_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
