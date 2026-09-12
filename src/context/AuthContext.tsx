import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { MOCK_USERS } from '../data/mockData'; // fallback for missing users or dev

interface AuthContextType {
  currentUser: User;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole, password?: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
  refreshProfile: (userId: string) => Promise<User | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER: User = {
  id: 'guest',
  name: 'Visiteur Public',
  email: 'guest@elimu.cd',
  role: 'guest'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initial check
    const checkSession = async () => {
      if (!supabase) {
        // Fallback if no supabase configured
        const saved = localStorage.getItem('elimu_current_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCurrentUser(parsed);
            setIsAuthenticated(parsed.role !== 'guest');
          } catch {}
        }
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(GUEST_USER);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkSession();

    // 2. Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(GUEST_USER);
          setIsAuthenticated(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const fetchUserProfile = async (userId: string): Promise<User | undefined> => {
    if (!supabase) return undefined;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          schoolId: data.school_id,
          phone: data.phone,
          childrenIds: data.children_ids || [],
          assignedClasses: data.assigned_classes || [],
          avatarUrl: data.avatar_url
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
        return user;
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
    return undefined;
  };

  // setRole is kept for the Demo UI toggle if still used, 
  // but with real backend it might just mock locally if Supabase is missing
  const setRole = (role: UserRole) => {
    if (!supabase) {
      const matched = MOCK_USERS.find(u => u.role === role);
      if (matched) {
        setCurrentUser(matched);
        setIsAuthenticated(true);
        localStorage.setItem('elimu_current_user', JSON.stringify(matched));
      } else {
        setCurrentUser(GUEST_USER);
        setIsAuthenticated(false);
        localStorage.removeItem('elimu_current_user');
      }
    }
  };

  const login = async (email: string, role?: UserRole, password?: string) => {
    if (!supabase) {
      // Mock logic if Supabase is not connected
      const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) 
        || (role ? MOCK_USERS.find(u => u.role === role) : MOCK_USERS[0]);
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
        localStorage.setItem('elimu_current_user', JSON.stringify(found));
        return found;
      }
      return undefined;
    }

    // Real Supabase Auth login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '12345678' // default dummy password for easy testing if not provided
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      return await fetchUserProfile(data.user.id);
    }
    return undefined;
  };

  const logout = async () => {
    if (!supabase) {
      setCurrentUser(GUEST_USER);
      setIsAuthenticated(false);
      localStorage.removeItem('elimu_current_user');
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile: fetchUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
