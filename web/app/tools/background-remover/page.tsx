'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Scissors, Upload, CheckCircle, Download } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setError('');
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('image/')) handleFile(dropped);
  }

  async function handleRemove() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResultUrl(null);
    try {
      const blob = await removeBackground(file);
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError((e as Error).message || 'Background removal failed');
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md">
            <Scissors size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Background Remover</h1>
            <p className="text-sm text-gray-500">Remove backgrounds instantly with AI</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors"
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
                <p className="text-sm text-gray-600">Drop an image here or <span className="text-violet-600 font-medium">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          </div>

          {/* Previews */}
          {(previewUrl || resultUrl) && (
            <div className={`grid gap-4 ${resultUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {previewUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5 text-center">Original</p>
                  <img src={previewUrl} alt="Original" className="w-full rounded-xl object-cover aspect-square border border-gray-200" />
                </div>
              )}
              {resultUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5 text-center">Result</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200 aspect-square" style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 16px 16px' }}>
                    <img src={resultUrl} alt="Result" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleRemove}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Processing… This may take a moment on first use (downloading AI model)' : 'Remove Background'}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {resultUrl && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <a
                href={resultUrl}
                download="background-removed.png"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
              >
                <Download size={15} /> Download PNG (transparent)
              </a>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Runs entirely in your browser — your image is never uploaded
          </p>
        </div>
      </div>
    </div>
  );
}
