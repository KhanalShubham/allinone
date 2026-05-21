'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileType, Upload, CheckCircle, Download, Copy, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') { setFile(dropped); setText(''); setError(''); }
  }

  async function extract() {
    if (!file) return;
    setLoading(true);
    setError('');
    setText('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/api/pdf/to-text`, { method: 'POST', body: formData });
      if (!res.ok) {
        let msg = 'Extraction failed';
        try {
          const err = (await res.json()) as { error?: string };
          if (err.error) msg = err.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      const data = (await res.json()) as { text: string; pages: number };
      setText(data.text);
      setPages(data.pages);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function downloadTxt() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '') || 'extracted'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <FileType size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PDF to Text</h1>
            <p className="text-sm text-gray-500">Extract text content from PDF files</p>
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
                <p className="text-sm text-gray-600">Drop a PDF here or <span className="text-blue-600 font-medium">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">PDF files only</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] || null); setText(''); setError(''); }} />
          </div>

          <button
            onClick={extract}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Extracting text…' : 'Extract Text'}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {text && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-blue-700">
                Extracted {pages} page{pages !== 1 ? 's' : ''}
              </p>
              <textarea
                readOnly
                value={text}
                className="w-full h-64 max-h-64 overflow-y-auto border border-blue-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyText}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                >
                  {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy all text'}
                </button>
                <button
                  onClick={downloadTxt}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
                >
                  <Download size={15} /> Download .txt
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Extracts plain text you can copy into Word — not a .docx file. Layout and images are not preserved. For scanned pages, use the OCR tool.
          </p>
        </div>
      </div>
    </div>
  );
}
