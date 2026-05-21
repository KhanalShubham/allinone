'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageDown, Download } from 'lucide-react';

type ThumbnailVariant = {
  label: string;
  quality: string;
  url: string;
};

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname === '/watch') {
      return parsed.searchParams.get('v');
    }
    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('?')[0] || null;
    }
    // youtube.com/shorts/VIDEO_ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/shorts/')) {
      return parsed.pathname.replace('/shorts/', '').split('?')[0] || null;
    }
  } catch {
    // invalid URL
  }
  return null;
}

function buildThumbnails(videoId: string): ThumbnailVariant[] {
  return [
    { label: 'HD', quality: 'Max Resolution', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
    { label: 'HQ', quality: 'High Quality', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
    { label: 'MQ', quality: 'Medium Quality', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
    { label: 'SD', quality: 'Standard', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
  ];
}

async function downloadImage(imageUrl: string, filename: string) {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export default function ThumbnailDownloaderPage() {
  const [url, setUrl] = useState('');
  const [thumbnails, setThumbnails] = useState<ThumbnailVariant[]>([]);
  const [error, setError] = useState('');
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  function handleGetThumbnail() {
    setError('');
    setThumbnails([]);

    if (!url.trim()) {
      setError('Please enter a YouTube URL.');
      return;
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      setError('Could not extract a video ID from this URL. Please use a valid YouTube link (youtube.com/watch, youtu.be, or youtube.com/shorts).');
      return;
    }

    setThumbnails(buildThumbnails(videoId));
  }

  async function handleDownload(thumb: ThumbnailVariant, index: number) {
    setDownloadingIndex(index);
    try {
      await downloadImage(thumb.url, `thumbnail_${thumb.label.toLowerCase()}.jpg`);
    } catch {
      setError(`Failed to download ${thumb.label} thumbnail. It may not exist for this video.`);
    } finally {
      setDownloadingIndex(null);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md flex items-center justify-center">
            <ImageDown size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Thumbnail Downloader</h1>
            <p className="text-sm text-gray-500">Download YouTube video thumbnails in all sizes</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="Paste YouTube URL here..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') handleGetThumbnail(); }}
            />
          </div>

          <button
            onClick={handleGetThumbnail}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            Get Thumbnail
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Thumbnail grid */}
          {thumbnails.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {thumbnails.map((thumb, i) => (
                <div
                  key={thumb.label}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb.url}
                    alt={`${thumb.quality} thumbnail`}
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="320" height="180" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14" font-family="sans-serif"%3ENot available%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="p-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-700">{thumb.label}</span>
                      <p className="text-xs text-gray-400">{thumb.quality}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(thumb, i)}
                      disabled={downloadingIndex === i}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                    >
                      <Download size={12} />
                      {downloadingIndex === i ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {thumbnails.length > 0 && (
            <p className="text-xs text-gray-400 text-center">
              Not all resolutions may be available for every video.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
