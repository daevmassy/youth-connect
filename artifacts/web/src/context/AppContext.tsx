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
  tracks: GospelTrack[];
  currentTrack: GospelTrack | null;
  isPlaying: boolean;
  playbackError: string | null;
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
  const [playbackError, setPlaybackError] = useState<string | null>(null);
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
    if (typeof Audio === 'undefined') return;
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      setIsPlaying(false);
      setPlaybackError('This audio file could not be played. Try another track.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    setPlaybackError(null);

    if (currentTrack?.audioUrl) {
      audio.pause();
      audio.src = currentTrack.audioUrl;
      audio.preload = 'auto';
      audio.load();
      if (isPlaying) {
        void audio.play().catch(() => {
          setIsPlaying(false);
          setPlaybackError('Playback was blocked. Press play again to start the track.');
        });
      }
    } else {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;
    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false);
        setPlaybackError('Playback was blocked. Press play again to start the track.');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.audioUrl]);

  const togglePlayPause = () => {
    if (!currentTrack) {
      if (tracks[0]) {
        handleSetCurrentTrack(tracks[0]);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSetCurrentTrack = (track: GospelTrack | null) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setPlaybackError(null);
    if (track) setIsPlaying(true);
    else setIsPlaying(false);
  };

  const playNext = () => {
    if (!currentTrack || tracks.length < 2) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % tracks.length;
    handleSetCurrentTrack(tracks[nextIdx]);
  };

  const playPrev = () => {
    if (!currentTrack || tracks.length < 2) return;
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
        playbackError,
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
