import { createContext, useContext, useEffect, useState } from 'react';

export const GOSPEL_TRACKS = [
  { id: "1", title: "Amazing Grace", artist: "Traditional", duration: 214, audioUrl: null },
  { id: "2", title: "How Great Thou Art", artist: "Stuart K. Hine", duration: 248, audioUrl: null },
  { id: "3", title: "Blessed Assurance", artist: "Fanny Crosby", duration: 196, audioUrl: null },
  { id: "4", title: "Great Is Thy Faithfulness", artist: "Thomas Chisholm", duration: 231, audioUrl: null },
  { id: "5", title: "It Is Well", artist: "Horatio Spafford", duration: 203, audioUrl: null },
];

const ADJECTIVES = ["Swift", "Gentle", "Brave", "Quiet", "Bright", "Loyal", "Kind", "Calm", "Fierce", "Noble"];
const ANIMALS = ["Dove", "Lion", "Lamb", "Eagle", "Hart", "Stag", "Sparrow", "Owl", "Hawk", "Fish"];

function generateAnonAlias() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${animal}${num}`;
}

interface AppContextType {
  isAdmin: boolean;
  setAdmin: (password: string) => boolean;
  anonAlias: string;
  tracks: typeof GOSPEL_TRACKS;
  currentTrack: typeof GOSPEL_TRACKS[0] | null;
  isPlaying: boolean;
  setCurrentTrack: (track: typeof GOSPEL_TRACKS[0] | null) => void;
  togglePlayPause: () => void;
  currentTime: number;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [anonAlias, setAnonAlias] = useState<string>('');
  
  const [currentTrack, setCurrentTrack] = useState<typeof GOSPEL_TRACKS[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let storedAlias = localStorage.getItem('yc_anon_alias');
    if (!storedAlias) {
      storedAlias = generateAnonAlias();
      localStorage.setItem('yc_anon_alias', storedAlias);
    }
    setAnonAlias(storedAlias);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handleSetAdmin = (password: string) => {
    if (password === 'PastorYC2026') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const togglePlayPause = () => {
    if (!currentTrack) {
      setCurrentTrack(GOSPEL_TRACKS[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSetCurrentTrack = (track: typeof GOSPEL_TRACKS[0] | null) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    if (track) setIsPlaying(true);
    else setIsPlaying(false);
  };

  const playNext = () => {
    if (!currentTrack) return;
    const idx = GOSPEL_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % GOSPEL_TRACKS.length;
    handleSetCurrentTrack(GOSPEL_TRACKS[nextIdx]);
  };

  const playPrev = () => {
    if (!currentTrack) return;
    const idx = GOSPEL_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + GOSPEL_TRACKS.length) % GOSPEL_TRACKS.length;
    handleSetCurrentTrack(GOSPEL_TRACKS[prevIdx]);
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        setAdmin: handleSetAdmin,
        anonAlias,
        tracks: GOSPEL_TRACKS,
        currentTrack,
        isPlaying,
        setCurrentTrack: handleSetCurrentTrack,
        togglePlayPause,
        currentTime,
        playNext,
        playPrev,
        seekTo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
