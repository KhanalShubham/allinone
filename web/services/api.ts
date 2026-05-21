const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

async function postForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

// --- QR ---
export const generateQr = (text: string, size: number, color: string, background: string) =>
  post<{ dataUrl: string }>('/api/qr/generate', { text, size, color, background });

// --- Image ---
export function compressImage(file: File, quality: number, format: string): Promise<Blob> {
  const form = new FormData();
  form.append('image', file);
  form.append('quality', String(quality));
  form.append('format', format);
  return fetch(`${BASE}/api/image/compress`, { method: 'POST', body: form }).then((r) => r.blob());
}

export function resizeImage(file: File, width?: number, height?: number): Promise<Blob> {
  const form = new FormData();
  form.append('image', file);
  if (width) form.append('width', String(width));
  if (height) form.append('height', String(height));
  return fetch(`${BASE}/api/image/resize`, { method: 'POST', body: form }).then((r) => r.blob());
}

export function convertImage(file: File, format: string): Promise<Blob> {
  const form = new FormData();
  form.append('image', file);
  form.append('format', format);
  return fetch(`${BASE}/api/image/convert`, { method: 'POST', body: form }).then((r) => r.blob());
}

// --- Utils ---
export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}
export const generatePassword = (opts: PasswordOptions) =>
  post<{ password: string }>('/api/utils/password', opts);

// --- PDF ---
export function mergePdfs(files: File[]): Promise<Blob> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return fetch(`${BASE}/api/pdf/merge`, { method: 'POST', body: form }).then((r) => r.blob());
}

export function pdfToText(file: File) {
  const form = new FormData();
  form.append('file', file);
  return postForm<{ text: string; pages: number; info: Record<string, unknown> }>(
    '/api/pdf/to-text',
    form,
  );
}

// --- Media ---
export const downloadYoutube = (url: string, format: 'mp3' | 'mp4', quality?: string) =>
  post<never>('/api/media/youtube', { url, format, quality });

export function createGif(file: File, startTime: number, duration: number): Promise<Blob> {
  const form = new FormData();
  form.append('video', file);
  form.append('startTime', String(startTime));
  form.append('duration', String(duration));
  return fetch(`${BASE}/api/media/gif`, { method: 'POST', body: form }).then((r) => r.blob());
}

export const downloadTikTok = (url: string) =>
  post<{ downloadUrl: string; downloadUrlWatermark?: string; title?: string; author?: string; filename: string }>(
    '/api/media/tiktok',
    { url },
  );

export const getYouTubeThumbnail = (url: string) =>
  get<{ videoId: string; thumbnailUrl: string; fallbackUrl: string; title?: string }>(
    `/api/media/thumbnail?url=${encodeURIComponent(url)}`,
  );

// --- Link Shortener ---
export const createShortLink = (url: string) =>
  post<{ code: string; shortUrl: string }>('/api/shortener/create', { url });

// --- Currency ---
export const getCurrencyRates = (base = 'USD') =>
  get<{ rates: Record<string, number>; base: string }>(`/api/currency/rates?base=${base}`);
