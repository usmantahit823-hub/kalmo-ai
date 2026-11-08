export type AspectRatio = '9:16' | '16:9' | '1:1';

export type VideoStyle =
  | 'Cinematic'
  | 'Anime'
  | 'AI Cartoon'
  | '3D Pixar'
  | 'Desi Folk Animation'
  | 'Cyberpunk'
  | '3D Render'
  | 'Claymation'
  | 'Hyper-Realistic'
  | 'Retro VHS'
  | 'Drone Shot'
  | 'Comic Book';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  license: string;
  url: string;
  albumArt: string;
}

export interface CaptionItem {
  start: number;
  end: number;
  text: string;
}

export interface ReelAuthor {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  followersCount: number;
}

export interface ReelMetrics {
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  views: number;
}

export interface ReelItem {
  id: string;
  author: ReelAuthor;
  title: string;
  description: string;
  tags: string[];
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  aspectRatio: AspectRatio;
  music: {
    title: string;
    artist: string;
    license: string;
    albumArt?: string;
    audioUrl?: string;
  };
  metrics: ReelMetrics;
  isLiked: boolean;
  isBookmarked: boolean;
  aiPrompt?: string;
  aiStyle?: string;
  isAiGenerated: boolean;
  createdAt: string;
  captions?: CaptionItem[];
  privacy: 'public' | 'followers' | 'private';
  allowComments: boolean;
  isFlagged?: boolean;
}

export interface ReelComment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  isVerified?: boolean;
  followingCount: number;
  followersCount: number;
  likesCount: number;
  credits: number;
  dailyCreditsQuota: number;
  creditsResetTime: string;
  tier: 'free' | 'creator_pro' | 'studio_max';
  isPrivate: boolean;
  allowDuets: boolean;
  allowDownloads: boolean;
  blockedUsers: string[];
}

export interface StudioClip {
  id: string;
  title: string;
  prompt: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  captions?: CaptionItem[];
  cameraMotion?: string;
  generationMethod?: string;
  creditsUsed: number;
  createdAt: string;
  transitionToNext?: 'fade' | 'wipe' | 'zoom' | 'glitch' | 'none';
}

export interface StudioProject {
  id: string;
  title: string;
  clips: StudioClip[];
  selectedMusicId?: string;
  musicVolume: number;
  voiceVolume: number;
  voiceoverAudioUrl?: string;
  filter: 'normal' | 'cyberpunk' | 'warm' | 'noir' | 'vhs';
  captionStyle: {
    color: string;
    bgColor: string;
    fontSize: 'small' | 'medium' | 'large';
    position: 'bottom' | 'middle' | 'top';
  };
}

export interface ReportItem {
  id: string;
  reelId: string;
  reelTitle: string;
  reportedBy: string;
  reason: 'copyright' | 'nsfw' | 'harassment' | 'spam' | 'misinformation';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'generation_ready' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  reelId?: string;
  avatar?: string;
}
