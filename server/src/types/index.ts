export type ImageFormat = 'jpeg' | 'webp' | 'png' | 'avif';
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
