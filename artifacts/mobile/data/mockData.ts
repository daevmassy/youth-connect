export interface GospelTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  lyrics?: string;
  playlistCategory: string;
  durationSeconds: number;
  createdAt: string;
}

export const GOSPEL_TRACKS: GospelTrack[] = [
  {
    id: 't1',
    title: 'I Love You Lord',
    artist: 'Ruwa City Choir',
    audioUrl: '',
    lyrics: 'I love You Lord, I love You Lord\nMy spirit loves You, I love You...',
    playlistCategory: 'Ruwa Worship',
    durationSeconds: 245,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't2',
    title: 'Jehovah Jireh',
    artist: 'Youth Praise Team',
    audioUrl: '',
    lyrics: 'Jehovah Jireh, my provider\nHis grace is sufficient for me...',
    playlistCategory: 'Ruwa Worship',
    durationSeconds: 312,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't3',
    title: 'Walk With Me',
    artist: 'Ruwa City Youth',
    audioUrl: '',
    lyrics: 'Walk with me, guide my every step\nYou alone, Lord, You alone...',
    playlistCategory: 'Ruwa Worship',
    durationSeconds: 198,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't4',
    title: 'Holy Spirit Come',
    artist: 'Blessing Shumba',
    audioUrl: '',
    lyrics: 'Holy Spirit come, restore us\nRestore us to Your heart...',
    playlistCategory: 'Quiet Time',
    durationSeconds: 287,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't5',
    title: 'Amazing Grace',
    artist: 'Youth Choir',
    audioUrl: '',
    lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me...',
    playlistCategory: 'Quiet Time',
    durationSeconds: 223,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't6',
    title: 'You Alone',
    artist: 'Ruwa City Youth',
    audioUrl: '',
    lyrics: 'You alone are my Lord\nYou alone we worship...',
    playlistCategory: 'Quiet Time',
    durationSeconds: 264,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

const CHAT_ALIASES = [
  'BraveHeart', 'BrightStar', 'FaithWalker', 'GraceFilled',
  'HopeBearer', 'JoyfulSoul', 'KindSpirit', 'LightSeeker',
  'PeaceMaker', 'PurposeDriven', 'RisingStar', 'SteadyHeart',
  'TrueFriend', 'WiseOwl', 'YoungLion', 'ZealousOne',
];

export function generateAlias(): string {
  return CHAT_ALIASES[Math.floor(Math.random() * CHAT_ALIASES.length)] +
    Math.floor(Math.random() * 90 + 10).toString();
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
