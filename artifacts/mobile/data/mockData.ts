export interface Devotion {
  id: string;
  publishDate: string;
  titleEn: string;
  titleSn: string;
  verseReference: string;
  verseTextEn: string;
  verseTextSn: string;
  reflectionEn: string;
  reflectionSn: string;
  actionPointEn: string;
  actionPointSn: string;
  createdAt: string;
}

export interface Question {
  id: string;
  ticketId: string;
  questionText: string;
  category: 'social' | 'spiritual' | 'economical';
  isAnswered: boolean;
  answeredByName?: string;
  answerText?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  isDailyFocus: boolean;
  requestText: string;
  prayCount: number;
  isAnswered: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  aliasName: string;
  messageText: string;
  isFlagged: boolean;
  isCurrentUser: boolean;
  createdAt: string;
}

export interface GospelTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  lyricsEn?: string;
  lyricsSn?: string;
  playlistCategory: string;
  durationSeconds: number;
  createdAt: string;
}

export interface ServiceEvent {
  id: string;
  title: string;
  titleSn: string;
  date: string;
  time: string;
  venue: string;
  speaker: string;
  theme: string;
  themeSn: string;
  rsvpCount: number;
}

export const DEVOTIONS: Devotion[] = [
  {
    id: 'd1',
    publishDate: new Date().toISOString().split('T')[0],
    titleEn: 'Purpose in the Storm',
    titleSn: 'Chinangwa Muchirima',
    verseReference: 'Jeremiah 29:11',
    verseTextEn:
      '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    verseTextSn:
      '"Nekuti ndinoziva zvandinofunga pamusoro penyu," Jehovha ndiye anodaro, "zvirevo zvokugutsikana kwenyu uye kwete kuipa kwenyu, kuti ndikupei tariro nemagumo."',
    reflectionEn:
      "Life is full of unexpected storms — exams, family struggles, uncertainty about the future. But God's promise in Jeremiah reminds us that He has already written a beautiful story for your life. The storm you're in right now is not the end of your story.",
    reflectionSn:
      'Hupenyu huzere nemhepo dzisina kutarisirwa — zvokupfuura, matambudziko emhuri, kusagara nechivimbo nezveramangwana. Asi vimbiso yaMwari muna Jeremiah inotirangaridza kuti Iye akatonyora nyaya yakanaka yohupenyu hwako.',
    actionPointEn:
      'Write down one worry you have today. Then write next to it: "God has a plan for this too."',
    actionPointSn:
      'Nyora chinhu chimwe chinokushushisa nhasi. Wobva wanyora padivi pacho: "Mwari ane zvirevo pamusoro pazvo zvakare."',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    publishDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    })(),
    titleEn: 'You Are Not Alone',
    titleSn: 'Hausi Wega',
    verseReference: 'Isaiah 41:10',
    verseTextEn:
      'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    verseTextSn:
      'Naizvozvo usatya, nokuti ndinewe; usaora mwoyo, nokuti ndini Mwari wako. Ndichakusimbisa, ndikubatsire; ndichakubatira noruoko rwangu rworudyi rwokururama.',
    reflectionEn:
      'Loneliness is one of the biggest battles for youth today. But God never promised to remove every hard thing — He promised to be with you through every hard thing. His presence is your strength.',
    reflectionSn:
      'Kushaiswa shauri ndechimwe chezvingurume zvikuru zvevechidiki nhasi. Asi Mwari haana kuvimbisa kubvisa chinhu chose chakaoma — Iye akavimbisa kuva newe pakati pechinhu chose chakaoma.',
    actionPointEn:
      'Text or call one friend today who might be going through a hard time.',
    actionPointSn:
      'Tumira meseji kana kufona shamwari imwe nhasi inogona kupfuura nenguva yakaoma.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'd3',
    publishDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      return d.toISOString().split('T')[0];
    })(),
    titleEn: 'Guard Your Heart',
    titleSn: 'Chengeta Moyo Wako',
    verseReference: 'Proverbs 4:23',
    verseTextEn:
      'Above all else, guard your heart, for everything you do flows from it.',
    verseTextSn:
      'Pamusoro pezvose, chengeta moyo wako, nokuti zvose zvinobuwa kubva mauri.',
    reflectionEn:
      'What you consume shapes who you become. The music, videos, conversations, and social media you engage with are planting seeds in your heart. Choose carefully what gets access to your mind.',
    reflectionSn:
      'Zvauno simudza zvino kugadzira unoita. Nziyo, mavhidhiyo, nhaurirano, uye maoniro esocial media zvaunoshanda nazvo zviri kudyara mbeu mumoyo mako.',
    actionPointEn: 'Do a 5-minute social media audit today. Unfollow 3 accounts that do not build your faith.',
    actionPointSn: 'Ita audit yeminiti mishanu yesocial media nhasi. Tsvaga ma-account matatu asingasimudzi kutenda kwako uasiiye.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    ticketId: '#RY-1042',
    questionText:
      'How do I deal with peer pressure at school? My friends want me to do things that go against my faith and I feel left out when I say no.',
    category: 'social',
    isAnswered: true,
    answeredByName: 'Pastor T',
    answerText:
      'This is such a real struggle, and I am proud of you for standing firm. Remember: true friends will respect your values. Peer pressure often reveals who your real friends are. Surround yourself with 1-2 believers at school who share your faith — you do not have to do this alone. Read Daniel 1 this week — he faced the same pressure and God honoured his stand.',
    answeredAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'q2',
    ticketId: '#RY-1039',
    questionText:
      'I am really struggling with forgiveness. Someone hurt me deeply and I know I should forgive them but I cannot seem to let go. What do I do?',
    category: 'spiritual',
    isAnswered: true,
    answeredByName: 'Elder Grace',
    answerText:
      'Forgiveness is one of the hardest things God asks of us, and it is a process — not a single moment. Forgiveness does not mean what they did was okay. It means you are choosing not to carry the weight of it anymore. Start by praying: "Lord, I choose to forgive even when I do not feel it yet. Help me to mean it." Do this every day until the feeling follows the decision.',
    answeredAt: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'q3',
    ticketId: '#RY-1045',
    questionText: 'Is it okay to listen to secular music? Or is all secular music a sin?',
    category: 'spiritual',
    isAnswered: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'q4',
    ticketId: '#RY-1033',
    questionText:
      'How can I grow my faith when I do not feel like praying? Sometimes I open my Bible and feel nothing.',
    category: 'spiritual',
    isAnswered: true,
    answeredByName: 'Pastor T',
    answerText:
      'What you are describing is a "spiritual dry season" — and every believer goes through it. Faith is not always a feeling. On the days you do not feel like reading, read anyway — even just one verse. On the days you do not feel like praying, pray anyway — even just "Lord, I do not know what to say but here I am." The discipline builds the habit, and the feeling follows the habit.',
    answeredAt: new Date(Date.now() - 432000000).toISOString(),
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 'q5',
    ticketId: '#RY-1047',
    questionText:
      'I am having financial problems at home and it is really affecting my peace. How do I keep trusting God when things are this hard?',
    category: 'economical',
    isAnswered: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: 'pr1',
    isDailyFocus: true,
    requestText: 'Pray for all youth writing O-Level and A-Level examinations this term. May God grant them wisdom, focus, and peace.',
    prayCount: 47,
    isAnswered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pr2',
    isDailyFocus: true,
    requestText: 'Pray for peace and safety in Ruwa and the surrounding communities.',
    prayCount: 34,
    isAnswered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pr3',
    isDailyFocus: false,
    requestText: 'Please pray for my mother. She has been sick for a long time and the doctors have not been able to help. I believe God can heal her.',
    prayCount: 23,
    isAnswered: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'pr4',
    isDailyFocus: false,
    requestText: 'Pray for me as I prepare for my O-Level results. I am really anxious. Thank you.',
    prayCount: 18,
    isAnswered: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'pr5',
    isDailyFocus: false,
    requestText: 'Please pray for my family. There is a lot of conflict at home and it is affecting my spiritual life.',
    prayCount: 31,
    isAnswered: false,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'pr6',
    isDailyFocus: false,
    requestText: 'God answered my prayer for a job! I want to thank everyone who prayed with me.',
    prayCount: 56,
    isAnswered: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'pr7',
    isDailyFocus: false,
    requestText: 'Pray for my younger sibling who has been skipping church. I want them to find their faith again.',
    prayCount: 12,
    isAnswered: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'cm1',
    aliasName: 'Mukoma_Nyeredzi',
    messageText: 'Good morning everyone! Anyone else feeling excited about Sunday service?',
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'cm2',
    aliasName: 'Sisi_Chiedza',
    messageText: 'Yes! Pastor T is speaking on purpose this week. Cannot wait.',
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 3540000).toISOString(),
  },
  {
    id: 'cm3',
    aliasName: 'Hama_Tariro',
    messageText: 'Does anyone have good tips for studying the Bible? I want to do more than just read a verse a day.',
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 3480000).toISOString(),
  },
  {
    id: 'cm4',
    aliasName: 'Mukoma_Simba',
    messageText: 'Try reading a whole chapter at once and asking: what does this teach me about God, what does it say about me, and what action can I take?',
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 3420000).toISOString(),
  },
  {
    id: 'cm5',
    aliasName: 'Sisi_Ruvimbo',
    messageText: "Today's devotion on Jeremiah 29:11 really spoke to me. I needed that reminder.",
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 3360000).toISOString(),
  },
  {
    id: 'cm6',
    aliasName: 'Hama_Makomborero',
    messageText: "Same! God's timing is not always our timing but it is always perfect.",
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 3300000).toISOString(),
  },
  {
    id: 'cm7',
    aliasName: 'Sisi_Farai',
    messageText: 'Can anyone pray with me? I have a big interview tomorrow.',
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'cm8',
    aliasName: 'Mukoma_Blessing',
    messageText: 'Praying for you right now. Isaiah 41:10 — do not fear, He is with you.',
    isFlagged: false,
    isCurrentUser: false,
    createdAt: new Date(Date.now() - 1740000).toISOString(),
  },
];

export const GOSPEL_TRACKS: GospelTrack[] = [
  {
    id: 't1',
    title: 'Ndinokupenda Ishe',
    artist: 'Ruwa City Choir',
    audioUrl: '',
    lyricsSn: 'Ndinokupenda Ishe, ndinokupenda Ishe\nMweya wangu unokupenda, Ndinokupenda...',
    lyricsEn: 'I love You Lord, I love You Lord\nMy spirit loves You, I love You...',
    playlistCategory: 'Ruwa Worship',
    durationSeconds: 245,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't2',
    title: 'Jehovah Jireh',
    artist: 'Youth Praise Team',
    audioUrl: '',
    lyricsEn: 'Jehovah Jireh, my provider\nHis grace is sufficient for me...',
    playlistCategory: 'Ruwa Worship',
    durationSeconds: 312,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't3',
    title: 'Handei Kumutumwa',
    artist: 'Ruwa City Youth',
    audioUrl: '',
    lyricsSn: 'Handei kumutumwa, handei nezvitendero\nNdimwe chete Ishe, ndimwe chete...',
    playlistCategory: 'Ruwa Worship',
    durationSeconds: 198,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't4',
    title: 'Mweya Mutsvene',
    artist: 'Blessing Shumba',
    audioUrl: '',
    lyricsSn: 'Mweya Mutsvene uya, tidzoreredze\nTidzoreredze kumwooyo wako...',
    lyricsEn: 'Holy Spirit come, restore us\nRestore us to Your heart...',
    playlistCategory: 'Quiet Time',
    durationSeconds: 287,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't5',
    title: 'Amazing Grace',
    artist: 'Youth Choir',
    audioUrl: '',
    lyricsEn: 'Amazing grace, how sweet the sound\nThat saved a wretch like me...',
    playlistCategory: 'Quiet Time',
    durationSeconds: 223,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 't6',
    title: 'Ndimwe Chete',
    artist: 'Ruwa City Youth',
    audioUrl: '',
    lyricsSn: 'Ndimwe chete Ishe wangu\nNdimwe chete tinonamata...',
    lyricsEn: 'You alone are my Lord\nYou alone we worship...',
    playlistCategory: 'Quiet Time',
    durationSeconds: 264,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

export const UPCOMING_SERVICE: ServiceEvent = {
  id: 's1',
  title: 'Youth Service',
  titleSn: 'Musangano Wevechidiki',
  date: (() => {
    const d = new Date();
    const day = d.getDay();
    const daysUntilSunday = (7 - day) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSunday);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  })(),
  time: '3:00 PM',
  venue: 'Ruwa City Church Hall',
  speaker: 'Pastor T. Chikwanda',
  theme: 'Walking in Purpose',
  themeSn: 'Kufamba muChinangwa',
  rsvpCount: 84,
};

export const CHAT_ALIASES = [
  'Mukoma_Nyeredzi', 'Sisi_Chiedza', 'Hama_Tariro', 'Mukoma_Simba',
  'Sisi_Ruvimbo', 'Hama_Makomborero', 'Mukoma_Farai', 'Sisi_Blessing',
  'Hama_Zvisinei', 'Mukoma_Rudo', 'Sisi_Vimbai', 'Hama_Tinashe',
  'Mukoma_Chido', 'Sisi_Panashe', 'Hama_Tapiwa', 'Mukoma_Yeukai',
];

export function generateAlias(): string {
  return CHAT_ALIASES[Math.floor(Math.random() * CHAT_ALIASES.length)] +
    Math.floor(Math.random() * 90 + 10).toString();
}

export function generateTicketId(): string {
  return '#RY-' + (Math.floor(Math.random() * 9000) + 1000).toString();
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
