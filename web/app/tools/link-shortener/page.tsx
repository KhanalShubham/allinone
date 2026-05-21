'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Link as LinkIcon, Copy, Check, ExternalLink } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ShortLink {
  code: string;
  shortUrl: string;
  url: string;
  clicks: number;
}

interface CreateResponse {
  code: string;
  shortUrl: string;
}

function truncate(str: string, max = 50) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function isValidUrl(val: string) {
  return /^https?:\/\/.+/.test(val);
}

export default function LinkShortenerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<{ code: string; shortUrl: string } | null>(null);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/shortener`)
      .then((r) => r.json())
      .then((data: ShortLink[]) => setLinks(data))
      .catch(() => { /* ignore */ });
  }, []);

  async function shorten() {
    if (!isValidUrl(url)) { setError('Please enter a valid URL starting with http:// or https://'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/shortener/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Failed to shorten URL');
      const data = (await res.json()) as CreateResponse;
      setResult(data);
      setLinks((prev) => [{ code: data.code, shortUrl: data.shortUrl, url, clicks: 0 }, ...prev]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copyShortUrl() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-md">
            <LinkIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Link Shortener</h1>
            <p className="text-sm text-gray-500">Shorten long URLs in one click</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* URL input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Long URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && shorten()}
              placeholder="https://example.com/very/long/url"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
            />
          </div>

          <button
            onClick={shorten}
            disabled={!url || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Shortening…' : 'Shorten URL'}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {result && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Your short link</p>
              <div className="flex items-center gap-2">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-blue-700 font-semibold text-sm hover:underline truncate"
                >
                  {result.shortUrl}
                </a>
                <button
                  onClick={copyShortUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shrink-0"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Recent links */}
          {links.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Recent links</p>
              <div className="space-y-2">
                {links.slice(0, 10).map((link) => (
                  <div key={link.code} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {link.shortUrl} <ExternalLink size={12} />
                      </a>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{truncate(link.url)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-800">{link.clicks}</p>
                      <p className="text-xs text-gray-400">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Links are stored temporarily — they reset when the server restarts
          </p>
        </div>
      </div>
    </div>
  );
}
