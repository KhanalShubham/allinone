'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Upload, CheckCircle, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type Format = 'jpeg' | 'png' | 'webp' | 'avif';

const FORMATS: { value: Format; label: string }[] = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png',  label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
];

function detectFormat(file: File): string {
  const map: Record<string, string> = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'image/avif': 'AVIF',
    'image/gif': 'GIF',
    'image/bmp': 'BMP',
    'image/tiff': 'TIFF',
  };
  return map[file.type] || file.type || 'Unknown';
}

export default function ImageConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<Format>('webp');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('image/')) { setFile(dropped); setResultUrl(null); setError(''); }
  }

  async function convert() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResultUrl(null);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('format', targetFormat);
    formData.append('quality', '95');
    try {
      const res = await fetch(`${API}/api/image/convert`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Conversion failed');
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-md">
            <RefreshCw size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Image Converter</h1>
            <p className="text-sm text-gray-500">Convert images to any format</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            {file ? (
              <div>
                <CheckCircle size={28} className="mx-auto text-green-500 mb-2" />
                <p className="font-medium text-sm text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatBytes(file.size)} · {detectFormat(file)} — click to change
                </p>
              </div>
            ) : (
              <div>
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Drop an image here or <span className="text-blue-600 font-medium">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP, AVIF, GIF, BMP</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] || null); setResultUrl(null); setError(''); }} />
          </div>

          {/* Format selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Convert to</p>
            <div className="flex gap-2 flex-wrap">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTargetFormat(f.value)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    targetFormat === f.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {file && (
            <p className="text-xs text-gray-500">
              Original format: <span className="font-medium text-gray-700">{detectFormat(file)}</span>
            </p>
          )}

          <button
            onClick={convert}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Converting…' : 'Convert Image'}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {resultUrl && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-700 mb-3">
                Converted · {formatBytes(resultSize)}
              </p>
              <a
                href={resultUrl}
                download={`converted.${targetFormat}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
              >
                <Download size={15} /> Download {FORMATS.find((f) => f.value === targetFormat)?.label}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
