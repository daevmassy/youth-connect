import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type ChatMessage,
  type Devotion,
  type GospelTrack,
  type PrayerRequest,
  type Question,
  CHAT_MESSAGES,
  DEVOTIONS,
  GOSPEL_TRACKS,
  PRAYER_REQUESTS,
  QUESTIONS,
  generateAlias,
  generateId,
  generateTicketId,
} from '@/data/mockData';

type Language = 'en' | 'sn';

interface AppContextType {
  // Language
  language: Language;
  toggleLanguage: () => void;
  t: (en: string, sn: string) => string;

  // User
  userAlias: string;
  streak: number;
  incrementStreak: () => Promise<void>;

  // Admin
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;

  // Devotions
  devotions: Devotion[];
  addDevotion: (devotion: Omit<Devotion, 'id' | 'createdAt'>) => void;
  todaysDevotion: Devotion | undefined;

  // Questions
  questions: Question[];
  myTicketIds: string[];
  submitQuestion: (text: string, category: Question['category']) => string;
  answerQuestion: (id: string, answer: string) => void;

  // Prayer
  prayerRequests: PrayerRequest[];
  prayedIds: string[];
  submitPrayerRequest: (text: string) => void;
  togglePray: (id: string) => void;
  addDailyFocus: (text: string) => void;
  markAnswered: (id: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  flagMessage: (id: string) => void;
  deleteMessage: (id: string) => void;

  // Music
  tracks: GospelTrack[];
  currentTrack: GospelTrack | null;
  isPlaying: boolean;
  playTrack: (track: GospelTrack) => void;
  pauseTrack: () => void;
  addTrack: (track: Omit<GospelTrack, 'id' | 'createdAt'>) => void;

  // RSVP
  hasRsvp: boolean;
  toggleRsvp: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_PASSWORD = 'PastorPekuti2024';
const STORAGE_KEYS = {
  language: 'pekuti_language',
  alias: 'pekuti_alias',
  streak: 'pekuti_streak',
  lastDevotionDate: 'pekuti_last_devotion',
  isAdmin: 'pekuti_is_admin',
  questions: 'pekuti_questions',
  myTickets: 'pekuti_my_tickets',
  prayers: 'pekuti_prayers',
  prayedIds: 'pekuti_prayed_ids',
  chatMessages: 'pekuti_chat',
  tracks: 'pekuti_tracks',
  rsvp: 'pekuti_rsvp',
  devotions: 'pekuti_devotions',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [userAlias, setUserAlias] = useState('');
  const [streak, setStreak] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [devotions, setDevotions] = useState<Devotion[]>(DEVOTIONS);
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [myTicketIds, setMyTicketIds] = useState<string[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(PRAYER_REQUESTS);
  const [prayedIds, setPrayedIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(CHAT_MESSAGES);
  const [tracks, setTracks] = useState<GospelTrack[]>(GOSPEL_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<GospelTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRsvp, setHasRsvp] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        savedLang, savedAlias, savedStreak, savedAdmin,
        savedQuestions, savedTickets, savedPrayers, savedPrayed,
        savedChat, savedTracks, savedRsvp, savedDevotions,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.language),
        AsyncStorage.getItem(STORAGE_KEYS.alias),
        AsyncStorage.getItem(STORAGE_KEYS.streak),
        AsyncStorage.getItem(STORAGE_KEYS.isAdmin),
        AsyncStorage.getItem(STORAGE_KEYS.questions),
        AsyncStorage.getItem(STORAGE_KEYS.myTickets),
        AsyncStorage.getItem(STORAGE_KEYS.prayers),
        AsyncStorage.getItem(STORAGE_KEYS.prayedIds),
        AsyncStorage.getItem(STORAGE_KEYS.chatMessages),
        AsyncStorage.getItem(STORAGE_KEYS.tracks),
        AsyncStorage.getItem(STORAGE_KEYS.rsvp),
        AsyncStorage.getItem(STORAGE_KEYS.devotions),
      ]);

      if (savedLang) setLanguage(savedLang as Language);

      if (savedAlias) {
        setUserAlias(savedAlias);
      } else {
        const alias = generateAlias();
        setUserAlias(alias);
        await AsyncStorage.setItem(STORAGE_KEYS.alias, alias);
      }

      if (savedStreak) setStreak(parseInt(savedStreak, 10));
      if (savedAdmin === 'true') setIsAdmin(true);

      if (savedQuestions) {
        const parsed = JSON.parse(savedQuestions) as Question[];
        setQuestions([...QUESTIONS, ...parsed.filter(q => !QUESTIONS.find(x => x.id === q.id))]);
      }
      if (savedTickets) setMyTicketIds(JSON.parse(savedTickets));
      if (savedPrayers) {
        const parsed = JSON.parse(savedPrayers) as PrayerRequest[];
        setPrayerRequests([...PRAYER_REQUESTS, ...parsed.filter(p => !PRAYER_REQUESTS.find(x => x.id === p.id))]);
      }
      if (savedPrayed) setPrayedIds(JSON.parse(savedPrayed));
      if (savedChat) {
        const parsed = JSON.parse(savedChat) as ChatMessage[];
        setChatMessages([...CHAT_MESSAGES, ...parsed.filter(m => !CHAT_MESSAGES.find(x => x.id === m.id))]);
      }
      if (savedTracks) {
        const parsed = JSON.parse(savedTracks) as GospelTrack[];
        setTracks([...GOSPEL_TRACKS, ...parsed.filter(t => !GOSPEL_TRACKS.find(x => x.id === t.id))]);
      }
      if (savedRsvp === 'true') setHasRsvp(true);
      if (savedDevotions) {
        const parsed = JSON.parse(savedDevotions) as Devotion[];
        setDevotions([...DEVOTIONS, ...parsed.filter(d => !DEVOTIONS.find(x => x.id === d.id))]);
      }
    } catch (_) {}
  }

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'sn' : 'en';
      AsyncStorage.setItem(STORAGE_KEYS.language, next);
      return next;
    });
  }, []);

  const t = useCallback((en: string, sn: string) => language === 'en' ? en : sn, [language]);

  const incrementStreak = useCallback(async () => {
    const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.lastDevotionDate);
    const today = new Date().toISOString().split('T')[0];
    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = lastDate === yesterday ? streak + 1 : 1;
      setStreak(newStreak);
      await AsyncStorage.setItem(STORAGE_KEYS.streak, newStreak.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.lastDevotionDate, today);
    }
  }, [streak]);

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

  const todaysDevotion = devotions.find(
    d => d.publishDate === new Date().toISOString().split('T')[0]
  ) ?? devotions[0];

  const addDevotion = useCallback((devotion: Omit<Devotion, 'id' | 'createdAt'>) => {
    const newDev: Devotion = { ...devotion, id: generateId(), createdAt: new Date().toISOString() };
    setDevotions(prev => {
      const updated = [newDev, ...prev];
      const extras = updated.filter(d => !DEVOTIONS.find(x => x.id === d.id));
      AsyncStorage.setItem(STORAGE_KEYS.devotions, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const submitQuestion = useCallback((text: string, category: Question['category']) => {
    const ticketId = generateTicketId();
    const newQ: Question = {
      id: generateId(),
      ticketId,
      questionText: text,
      category,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };
    setQuestions(prev => {
      const updated = [newQ, ...prev];
      const extras = updated.filter(q => !QUESTIONS.find(x => x.id === q.id));
      AsyncStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(extras));
      return updated;
    });
    setMyTicketIds(prev => {
      const updated = [ticketId, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.myTickets, JSON.stringify(updated));
      return updated;
    });
    return ticketId;
  }, []);

  const answerQuestion = useCallback((id: string, answer: string) => {
    setQuestions(prev => {
      const updated = prev.map(q =>
        q.id === id
          ? { ...q, isAnswered: true, answerText: answer, answeredByName: 'Pastor', answeredAt: new Date().toISOString() }
          : q
      );
      const extras = updated.filter(q => !QUESTIONS.find(x => x.id === q.id));
      AsyncStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const submitPrayerRequest = useCallback((text: string) => {
    const newPr: PrayerRequest = {
      id: generateId(),
      isDailyFocus: false,
      requestText: text,
      prayCount: 0,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };
    setPrayerRequests(prev => {
      const updated = [newPr, ...prev];
      const extras = updated.filter(p => !PRAYER_REQUESTS.find(x => x.id === p.id));
      AsyncStorage.setItem(STORAGE_KEYS.prayers, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const togglePray = useCallback((id: string) => {
    // Compute hasPrayed inside setPrayedIds updater so both state updates
    // use the same atomic snapshot — avoids stale closure race conditions.
    setPrayedIds(prevIds => {
      const hasPrayed = prevIds.includes(id);
      const updatedIds = hasPrayed ? prevIds.filter(x => x !== id) : [...prevIds, id];
      AsyncStorage.setItem(STORAGE_KEYS.prayedIds, JSON.stringify(updatedIds));

      // Nest the prayerRequests update here so it derives from the same hasPrayed value.
      setPrayerRequests(prevPrayers => {
        const updated = prevPrayers.map(p =>
          p.id === id
            ? { ...p, prayCount: hasPrayed ? Math.max(0, p.prayCount - 1) : p.prayCount + 1 }
            : p
        );
        const extras = updated.filter(p => !PRAYER_REQUESTS.find(x => x.id === p.id));
        AsyncStorage.setItem(STORAGE_KEYS.prayers, JSON.stringify(extras));
        return updated;
      });

      return updatedIds;
    });
  }, []);

  const addDailyFocus = useCallback((text: string) => {
    const focus: PrayerRequest = {
      id: generateId(),
      isDailyFocus: true,
      requestText: text,
      prayCount: 0,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };
    setPrayerRequests(prev => {
      const updated = [focus, ...prev];
      const extras = updated.filter(p => !PRAYER_REQUESTS.find(x => x.id === p.id));
      AsyncStorage.setItem(STORAGE_KEYS.prayers, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const markAnswered = useCallback((id: string) => {
    setPrayerRequests(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, isAnswered: true } : p);
      const extras = updated.filter(p => !PRAYER_REQUESTS.find(x => x.id === p.id));
      AsyncStorage.setItem(STORAGE_KEYS.prayers, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: generateId(),
      aliasName: userAlias,
      messageText: text,
      isFlagged: false,
      isCurrentUser: true,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => {
      const updated = [...prev, msg];
      const extras = updated.filter(m => !CHAT_MESSAGES.find(x => x.id === m.id));
      AsyncStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(extras));
      return updated;
    });
  }, [userAlias]);

  const flagMessage = useCallback((id: string) => {
    setChatMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, isFlagged: true } : m);
      const extras = updated.filter(m => !CHAT_MESSAGES.find(x => x.id === m.id));
      AsyncStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setChatMessages(prev => {
      const updated = prev.filter(m => m.id !== id);
      const extras = updated.filter(m => !CHAT_MESSAGES.find(x => x.id === m.id));
      AsyncStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const playTrack = useCallback((track: GospelTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const addTrack = useCallback((track: Omit<GospelTrack, 'id' | 'createdAt'>) => {
    const newTrack: GospelTrack = { ...track, id: generateId(), createdAt: new Date().toISOString() };
    setTracks(prev => {
      const updated = [...prev, newTrack];
      const extras = updated.filter(t => !GOSPEL_TRACKS.find(x => x.id === t.id));
      AsyncStorage.setItem(STORAGE_KEYS.tracks, JSON.stringify(extras));
      return updated;
    });
  }, []);

  const toggleRsvp = useCallback(() => {
    setHasRsvp(prev => {
      AsyncStorage.setItem(STORAGE_KEYS.rsvp, (!prev).toString());
      return !prev;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        language, toggleLanguage, t,
        userAlias, streak, incrementStreak,
        isAdmin, adminLogin, adminLogout,
        devotions, addDevotion, todaysDevotion,
        questions, myTicketIds, submitQuestion, answerQuestion,
        prayerRequests, prayedIds, submitPrayerRequest, togglePray, addDailyFocus, markAnswered,
        chatMessages, sendChatMessage, flagMessage, deleteMessage,
        tracks, currentTrack, isPlaying, playTrack, pauseTrack, addTrack,
        hasRsvp, toggleRsvp,
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
