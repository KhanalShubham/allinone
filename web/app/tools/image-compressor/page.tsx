'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Minimize2, Upload, Download, CheckCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatBytes(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressorPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [quality, setQuality]   = useState(80);
  const [format, setFormat]     = useState<'jpeg' | 'webp' | 'png'>('jpeg');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('image/')) { setFile(dropped); setResultUrl(null); }
  }

  async function compress() {
    if (!file) return;
    setLoading(true); setError(''); setResultUrl(null);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', String(quality));
    formData.append('format', format);
    try {
      const res = await fetch(`${API}/api/image/compress`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Compression failed');
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const savings = file && resultSize ? Math.round((1 - resultSize / file.size) * 100) : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Minimize2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Image Compressor</h1>
            <p className="text-sm text-gray-500">Make images smaller without losing quality</p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors mb-5"
        >
          {file ? (
            <div>
              <CheckCircle size={28} className="mx-auto text-green-500 mb-2" />
              <p className="font-medium text-sm text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatBytes(file.size)} — click to change</p>
            </div>
          ) : (
            <div>
              <Upload size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Drop an image here or <span className="text-blue-600 font-medium">click to browse</span></p>
              <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP — up to 20 MB</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setResultUrl(null); }} />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Quality</span>
              <span className="font-mono font-semibold text-gray-900">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Output format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as 'jpeg' | 'webp' | 'png')}
              className="w-full border border-gray-300 rounded-lg px-3 h-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>

        <button onClick={compress} disabled={!file || loading}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
          {loading ? 'Compressing…' : 'Compress Image'}
        </button>

        {error && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        {resultUrl && (
          <div className="mt-5 border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>Original: <span className="font-medium text-gray-900">{file && formatBytes(file.size)}</span></p>
                <p>Compressed: <span className="font-medium text-gray-900">{formatBytes(resultSize)}</span></p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{savings}%</div>
                <div className="text-xs text-gray-500">smaller</div>
              </div>
            </div>
            <a href={resultUrl} download={`compressed.${format}`}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors">
              <Download size={15} /> Download Compressed Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
