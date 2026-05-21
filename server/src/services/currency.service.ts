import https from 'https';
import type { CacheEntry } from '../types';

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 60 * 1000;

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let raw = '';
        response.on('data', (chunk: string) => { raw += chunk; });
        response.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(e); }
        });
      })
      .on('error', reject);
  });
}

export async function getRates(base: string): Promise<unknown> {
  const cached = cache[base];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const data = await fetchJson(`https://api.exchangerate-api.com/v4/latest/${base}`);
  cache[base] = { data, timestamp: Date.now() };
  return data;
}
