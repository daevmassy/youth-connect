import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getListMusicQueryKey, useListMusic } from '@workspace/api-client-react';
import { useAuth } from './AuthContext';

export interface GospelTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string | null;
}

export const GOSPEL_TRACKS: GospelTrack[] = [
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
  anonAlias: string;
  tracks: typeof GOSPEL_TRACKS;
  currentTrack: typeof GOSPEL_TRACKS[0] | null;
  isPlaying: boolean;
  setCurrentTrack: (track: GospelTrack | null) => void;
  togglePlayPause: () => void;
  currentTime: number;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdminAuthenticated } = useAuth();
  const [anonAlias, setAnonAlias] = useState<string>('');
  const [currentTrack, setCurrentTrack] = useState<GospelTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: musicData } = useListMusic({
    query: {
      queryKey: getListMusicQueryKey(),
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
    },
  });

  const tracks = useMemo<GospelTrack[]>(
    () => [
      ...GOSPEL_TRACKS,
      ...(musicData?.tracks ?? []).map((track) => ({
        id: `server-${track.id}`,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        audioUrl: track.audioUrl,
      })),
    ],
    [musicData?.tracks],
  );

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

  useEffect(() => {
    if (typeof Audio === 'undefined') return;
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    if (currentTrack?.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.currentTime = currentTime;
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      if (isPlaying) {
        void audio.play().catch(() => setIsPlaying(false));
      }
    } else {
      audio.pause();
      audio.removeAttribute('src');
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.audioUrl]);

  const togglePlayPause = () => {
    if (!currentTrack) {
      setCurrentTrack(tracks[0]);
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
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % tracks.length;
    handleSetCurrentTrack(tracks[nextIdx]);
  };

  const playPrev = () => {
    if (!currentTrack) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + tracks.length) % tracks.length;
    handleSetCurrentTrack(tracks[prevIdx]);
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current && currentTrack?.audioUrl) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAdmin: isAdminAuthenticated,
        anonAlias,
        tracks,
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
