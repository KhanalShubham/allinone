export type ImageFormat = 'jpeg' | 'webp' | 'png' | 'avif';
export type AiTone = 'formal' | 'casual' | 'shorter' | 'detailed';
export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter';
export type MediaFormat = 'mp3' | 'mp4';

export interface LinkEntry {
  code: string;
  originalUrl: string;
  createdAt: Date;
  clicks: number;
}

export interface CacheEntry {
  data: unknown;
  timestamp: number;
}
