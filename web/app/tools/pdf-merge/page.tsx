'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, FilePlus, Upload, X, ChevronUp, ChevronDown } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfMergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf');
    if (dropped.length) {
      setFiles((prev) => [...prev, ...dropped]);
      setError('');
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []).filter((f) => f.type === 'application/pdf');
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected]);
      setError('');
    }
    e.target.value = '';
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    setFiles((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  async function merge() {
    if (files.length < 2) { setError('Add at least 2 PDF files to merge.'); return; }
    setLoading(true);
    setError('');
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    try {
      const res = await fetch(`${API}/api/pdf/merge`, { method: 'POST', body: formData });
      if (!res.ok) {
        let msg = 'Merge failed';
        try {
          const err = (await res.json()) as { error?: string };
          if (err.error) msg = err.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <FilePlus size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PDF Merge</h1>
            <p className="text-sm text-gray-500">Combine multiple PDFs into one file</p>
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
            <Upload size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Drop PDF files here or <span className="text-blue-600 font-medium">click to browse</span></p>
            <p className="text-xs text-gray-400 mt-1">Select multiple files — they will be merged in order</p>
            <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFileInput} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
                <span>Total: {formatBytes(totalSize)}</span>
              </div>
              {files.map((f, idx) => (
                <div key={`${f.name}-${idx}`} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveDown(idx)} disabled={idx === files.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 w-5 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(f.size)}</p>
                  </div>
                  <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={merge}
            disabled={files.length < 2 || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? `Merging ${files.length} files…` : `Merge ${files.length > 0 ? files.length : ''} PDFs`}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
