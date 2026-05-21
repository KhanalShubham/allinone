'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ScanText, Upload, CheckCircle, Download, Copy, Check } from 'lucide-react';
import { createWorker, Worker } from 'tesseract.js';

type Language = { code: string; label: string };

const LANGUAGES: Language[] = [
  { code: 'eng', label: 'English' },
  { code: 'hin', label: 'Hindi' },
  { code: 'nep', label: 'Nepali' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lang, setLang] = useState('eng');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setText('');
    setError('');
    setPreviewUrl(URL.createObjectURL(f));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('image/')) handleFile(dropped);
  }

  async function recognize() {
    if (!file) return;
    setLoading(true);
    setError('');
    setText('');
    setProgress('Loading language model… (first time may take a moment)');
    try {
      if (workerRef.current) {
        await workerRef.current.terminate();
        workerRef.current = null;
      }
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'loading tesseract core') {
            setProgress('Loading OCR engine…');
          } else if (m.status === 'initializing tesseract') {
            setProgress('Initializing…');
          } else if (m.status === 'loading language traineddata') {
            setProgress(`Loading language model… ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'initializing api') {
            setProgress('Initializing API…');
          } else if (m.status === 'recognizing text') {
            setProgress(`Recognizing text… ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      workerRef.current = worker;
      const result = await worker.recognize(file);
      setText(result.data.text);
      setProgress('');
    } catch (e) {
      setError((e as Error).message || 'Recognition failed');
      setProgress('');
    } finally {
      setLoading(false);
    }
  }

  function downloadTxt() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.split('.').slice(0, -1).join('.') || 'ocr-result'}.txt`;
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md">
            <ScanText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">OCR — Image to Text</h1>
            <p className="text-sm text-gray-500">Extract text from images in your browser</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
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
                <p className="text-sm text-gray-600">Drop an image here or <span className="text-amber-600 font-medium">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP, BMP, TIFF</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          </div>

          {/* Image preview */}
          {previewUrl && (
            <div>
              <img src={previewUrl} alt="Preview" className="w-full rounded-xl border border-gray-200 max-h-48 object-contain bg-gray-50" />
            </div>
          )}

          {/* Language selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 text-sm bg-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={recognize}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? (progress || 'Processing…') : 'Extract Text'}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {text && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-blue-700">Text extracted successfully</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 border border-blue-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyText}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                >
                  {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy text'}
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
            Runs in your browser — your image is never uploaded
          </p>
        </div>
      </div>
    </div>
  );
}
