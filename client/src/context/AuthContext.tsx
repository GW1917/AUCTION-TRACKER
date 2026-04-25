import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from '../auth';
import api from '../api';

interface Profile {
  id: string;
  email: string;
  dealershipName: string;
  fullName: string;
}

interface AuthContextType {
  profile: Profile | null;
  profileLoading: boolean;
  profileMissing: boolean;
  saveProfile: (dealershipName: string, fullName: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      setProfile(null);
      setProfileMissing(false);
      return;
    }

    setProfileLoading(true);
    api.get('/auth/profile')
      .then(({ data }) => {
        setProfile(data);
        setProfileMissing(false);
      })
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.data?.code === 'PROFILE_MISSING') {
          setProfileMissing(true);
        }
      })
      .finally(() => setProfileLoading(false));
  }, [session?.user?.id, isPending]);

  async function saveProfile(dealershipName: string, fullName: string) {
    const { data } = await api.post('/auth/profile', { dealershipName, fullName });
    setProfile(data);
    setProfileMissing(false);
  }

  return (
    <AuthContext.Provider value={{
      profile,
      profileLoading,
      profileMissing,
      saveProfile,
      isAuthenticated: !!session,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
