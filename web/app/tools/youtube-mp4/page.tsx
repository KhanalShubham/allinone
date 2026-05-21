'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Video } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Quality = 'best' | '1080p' | '720p' | '480p' | '360p';

const QUALITY_OPTIONS: { label: string; value: Quality }[] = [
  { label: 'Best available', value: 'best' },
  { label: '1080p', value: '1080p' },
  { label: '720p', value: '720p' },
  { label: '480p', value: '480p' },
  { label: '360p', value: '360p' },
];

function isValidYouTubeUrl(url: string): boolean {
  return /youtube\.com\/(watch|shorts|embed)|youtu\.be\//i.test(url);
}

export default function YoutubeMp4Page() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<Quality>('best');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');

  async function handleDownload() {
    setError('');
    setUrlError('');

    if (!url.trim()) {
      setUrlError('Please enter a YouTube URL.');
      return;
    }
    if (!isValidYouTubeUrl(url)) {
      setUrlError('URL must contain youtube.com/watch or youtu.be');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/media/youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format: 'mp4', quality }),
      });

      if (!res.ok) {
        let msg = 'Download failed.';
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
          else if (data.message) msg = data.message;
        } catch {
          // ignore
        }
        setError(msg);
        return;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'video.mp4';
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-md flex items-center justify-center">
            <Video size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">YouTube to MP4</h1>
            <p className="text-sm text-gray-500">Download YouTube videos in your preferred quality</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* URL input */}
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
              placeholder="Paste YouTube URL here..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {urlError && <p className="text-red-500 text-xs mt-1.5">{urlError}</p>}
          </div>

          {/* Quality selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as Quality)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              {QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Downloading video...' : 'Download MP4'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            Video quality depends on what is available for the source video. Some quality options may not be available for all videos.
          </div>

          <p className="text-xs text-gray-400 text-center">
            Only download content you have the right to use.
          </p>
        </div>
      </div>
    </div>
  );
}
