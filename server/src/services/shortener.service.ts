import type { LinkEntry } from '../types';

const store = new Map<string, LinkEntry>();

let _nanoid: ((size?: number) => string) | null = null;

async function getNanoid(): Promise<(size?: number) => string> {
  if (_nanoid) return _nanoid;
  const mod = await import('nanoid');
  _nanoid = mod.nanoid as (size?: number) => string;
  return _nanoid;
}

export async function createLink(originalUrl: string): Promise<LinkEntry> {
  const nanoid = await getNanoid();
  const code = nanoid(6);
  const entry: LinkEntry = { code, originalUrl, createdAt: new Date(), clicks: 0 };
  store.set(code, entry);
  return entry;
}

export function getLink(code: string): LinkEntry | undefined {
  return store.get(code);
}

export function incrementClicks(code: string): void {
  const entry = store.get(code);
  if (entry) entry.clicks += 1;
}

export function listLinks(): LinkEntry[] {
  return Array.from(store.values());
}
