'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Upload, CheckCircle, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultDims, setResultDims] = useState<{ w: number; h: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const originalDims = useRef<{ w: number; h: number } | null>(null);

  function readImageDimensions(f: File) {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      originalDims.current = { w: img.naturalWidth, h: img.naturalHeight };
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setResultDims(null);
    setError('');
    readImageDimensions(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('image/')) handleFile(dropped);
  }

  function handleWidthChange(val: string) {
    setWidth(val);
    if (keepAspect && originalDims.current && val) {
      const ratio = originalDims.current.h / originalDims.current.w;
      setHeight(String(Math.round(Number(val) * ratio)));
    }
  }

  function handleHeightChange(val: string) {
    setHeight(val);
    if (keepAspect && originalDims.current && val) {
      const ratio = originalDims.current.w / originalDims.current.h;
      setWidth(String(Math.round(Number(val) * ratio)));
    }
  }

  async function resize() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResultUrl(null);
    const formData = new FormData();
    formData.append('image', file);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);
    formData.append('format', format);
    try {
      const res = await fetch(`${API}/api/image/resize`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Resize failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      const img = new Image();
      img.onload = () => setResultDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = url;
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
            <Maximize2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Image Resizer</h1>
            <p className="text-sm text-gray-500">Resize images to exact dimensions</p>
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
                <p className="text-xs text-gray-500 mt-0.5">{formatBytes(file.size)} — click to change</p>
              </div>
            ) : (
              <div>
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Drop an image here or <span className="text-blue-600 font-medium">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          </div>

          {/* Width / Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                placeholder="e.g. 1920"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                placeholder="e.g. 1080"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          {/* Keep aspect ratio */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => setKeepAspect(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Keep aspect ratio</span>
          </label>

          {/* Output format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Output format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm bg-white"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <button
            onClick={resize}
            disabled={!file || loading || (!width && !height)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Resizing…' : 'Resize Image'}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {resultUrl && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-700 mb-3">
                {resultDims ? `New size: ${resultDims.w} × ${resultDims.h} px` : 'Done!'}
              </p>
              <a
                href={resultUrl}
                download={`resized.${format}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
              >
                <Download size={15} /> Download Resized Image
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
