import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'candidate' | 'analyst';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      try {
        // Decode simple token format: "user_id:email:name:role"
        const [userID, email, name, role] = token.split(':');
        setUser({ id: userID, email, name, role: role as any });
      } catch (error) {
        localStorage.removeItem('auth_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, role: 'admin' | 'candidate') => {
    // Simple demo authentication
    const token = `user_${Date.now()}:${email}:User Name:${role}`;
    localStorage.setItem('auth_token', token);
    setUser({ 
      id: `user_${Date.now()}`, 
      email, 
      name: 'User Name', 
      role 
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getAuthToken,
  };
}
