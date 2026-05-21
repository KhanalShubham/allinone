'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Music2, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TiktokResponse {
  downloadUrl: string;
  downloadUrlWatermark?: string;
  title?: string;
  author?: string;
  filename: string;
}

export default function TiktokDownloaderPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TiktokResponse | null>(null);

  async function handleDownload() {
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a TikTok URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/media/tiktok`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await res.json()) as TiktokResponse & { error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Download failed. Check the URL and try again.');
        return;
      }

      if (!data.downloadUrl) {
        setError('Server returned no download link for this video.');
        return;
      }

      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setError(
          'Could not reach the server. Make sure the API is running (npm run dev in the server folder).',
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-md flex items-center justify-center">
            <Music2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TikTok Downloader</h1>
            <p className="text-sm text-gray-500">Download TikTok videos without watermark</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
                setResult(null);
              }}
              placeholder="Paste TikTok video URL..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleDownload();
              }}
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Fetching video...' : 'Download Video'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              {result.title && (
                <p className="text-sm font-semibold text-blue-900 line-clamp-2">{result.title}</p>
              )}
              {result.author && (
                <p className="text-xs text-blue-700">@{result.author}</p>
              )}
              <a
                href={result.downloadUrl}
                download={result.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
              >
                <Download size={15} />
                Save Video (no watermark)
              </a>
              {result.filename && (
                <p className="text-xs text-blue-600 text-center">{result.filename}</p>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            Downloads are resolved on the server — no third-party API keys required in your browser.
          </div>

          <p className="text-xs text-gray-400 text-center">
            Only download content you have permission to use.
          </p>
        </div>
      </div>
    </div>
  );
}
