'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Film, Upload, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function GifMakerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [loading, setLoading] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const [error, setError] = useState('');
  const [ffmpegError, setFfmpegError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }
    setFile(f);
    setError('');
    setGifUrl('');
    setFfmpegError(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  async function handleCreate() {
    if (!file) {
      setError('Please select a video file first.');
      return;
    }
    if (duration < 1 || duration > 10) {
      setError('Duration must be between 1 and 10 seconds.');
      return;
    }

    setError('');
    setGifUrl('');
    setFfmpegError(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('startTime', String(startTime));
      formData.append('duration', String(duration));

      const res = await fetch(`${API}/api/media/gif`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let msg = 'GIF creation failed.';
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
          else if (data.message) msg = data.message;
        } catch {
          // ignore
        }
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('ffmpeg') || lowerMsg.includes('ff mpeg')) {
          setFfmpegError(true);
        } else {
          setError(msg);
        }
        return;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setGifUrl(objectUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      if (msg.toLowerCase().includes('ffmpeg')) {
        setFfmpegError(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!gifUrl) return;
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = 'animation.gif';
    a.click();
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 shadow-md flex items-center justify-center">
            <Film size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GIF Maker</h1>
            <p className="text-sm text-gray-500">Convert a video clip into an animated GIF</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
            <Upload size={28} className="mx-auto mb-3 text-gray-400" />
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB — click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700">Drop a video here or click to select</p>
                <p className="text-xs text-gray-400 mt-1">Supports MP4, MOV, AVI, WebM and more</p>
              </div>
            )}
          </div>

          {/* Start time + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start time (seconds)
              </label>
              <input
                type="number"
                min={0}
                value={startTime}
                onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration (seconds)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={duration}
                onChange={(e) => setDuration(Math.min(10, Math.max(1, Number(e.target.value))))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !file}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Creating GIF...' : 'Create GIF'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {ffmpegError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">FFmpeg required</p>
              <p>
                GIF creation requires FFmpeg to be installed on the server. Install it at{' '}
                <a
                  href="https://ffmpeg.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  ffmpeg.org
                </a>
                .
              </p>
            </div>
          )}

          {/* Preview */}
          {gifUrl && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-900">GIF created!</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gifUrl} alt="Generated GIF" className="w-full rounded-lg" />
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
              >
                <Download size={15} />
                Download GIF
              </button>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
            Keep duration under 10 seconds for best results. Longer clips produce very large GIF files.
          </div>
        </div>
      </div>
    </div>
  );
}
