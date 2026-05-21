'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function QRGeneratorPage() {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/qr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, color, background: bg, size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDataUrl(data.dataUrl);
    } catch (e) {
      setError((e as Error).message || 'Something went wrong. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    a.click();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <QrCode size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">QR Code Generator</h1>
            <p className="text-sm text-gray-500">Create a QR code for any link or text</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* URL input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Enter a URL or any text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Options row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Foreground</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-300 cursor-pointer p-1 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-300 cursor-pointer p-1 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-9 border border-gray-300 rounded-lg px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {[128, 256, 512, 1024].map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!text.trim() || loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {loading ? 'Generating…' : 'Generate QR Code'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {dataUrl && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt="Generated QR code" width={Math.min(size, 220)} height={Math.min(size, 220)} />
            </div>
            <button
              onClick={download}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
            >
              <Download size={15} /> Download PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
