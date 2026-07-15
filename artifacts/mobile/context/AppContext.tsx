import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type GospelTrack, GOSPEL_TRACKS, generateAlias } from '@/data/mockData';

interface AppContextType {
  // Admin (app-wide moderator/pastor mode, separate from user accounts)
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;

  // Anonymous chat alias (kept stable per device for the anonymous room)
  anonAlias: string;

  // Music
  tracks: GospelTrack[];
  currentTrack: GospelTrack | null;
  isPlaying: boolean;
  playTrack: (track: GospelTrack) => void;
  pauseTrack: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_PASSWORD = 'PastorYC2026';
const STORAGE_KEYS = {
  isAdmin: 'yc_is_admin',
  anonAlias: 'yc_anon_alias',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [anonAlias, setAnonAlias] = useState('');
  const [tracks] = useState<GospelTrack[]>(GOSPEL_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<GospelTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedAdmin, savedAlias] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.isAdmin),
        AsyncStorage.getItem(STORAGE_KEYS.anonAlias),
      ]);
      if (savedAdmin === 'true') setIsAdmin(true);
      if (savedAlias) {
        setAnonAlias(savedAlias);
      } else {
        const alias = generateAlias();
        setAnonAlias(alias);
        await AsyncStorage.setItem(STORAGE_KEYS.anonAlias, alias);
      }
    })();
  }, []);

  const adminLogin = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      AsyncStorage.setItem(STORAGE_KEYS.isAdmin, 'true');
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    AsyncStorage.setItem(STORAGE_KEYS.isAdmin, 'false');
  }, []);

  const playTrack = useCallback((track: GospelTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAdmin, adminLogin, adminLogout,
        anonAlias,
        tracks, currentTrack, isPlaying, playTrack, pauseTrack,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
