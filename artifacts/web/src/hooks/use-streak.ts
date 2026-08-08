import { useEffect, useState } from 'react';

export function useDevotionalStreak(userId: number | undefined) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const key = `yc_streak_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setStreak(data.count || 0);
      } catch (e) {
        // ignore
      }
    }
  }, [userId]);

  const updateStreak = () => {
    if (!userId) return;
    
    const key = `yc_streak_${userId}`;
    const stored = localStorage.getItem(key);
    
    const today = new Date().toISOString().split('T')[0];
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.lastDate !== today) {
          const newCount = (data.count || 0) + 1;
          localStorage.setItem(key, JSON.stringify({ lastDate: today, count: newCount }));
          setStreak(newCount);
        }
      } catch (e) {
        localStorage.setItem(key, JSON.stringify({ lastDate: today, count: 1 }));
        setStreak(1);
      }
    } else {
      localStorage.setItem(key, JSON.stringify({ lastDate: today, count: 1 }));
      setStreak(1);
    }
  };

  return { streak, updateStreak };
}
