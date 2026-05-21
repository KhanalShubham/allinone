'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Copy, Check, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/utils/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length, uppercase, lowercase, numbers, symbols }),
      });
      const data = await res.json();
      setPassword(data.password);
    } catch {
      let charset = '';
      if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (numbers)   charset += '0123456789';
      if (symbols)   charset += '!@#$%^&*()-_=+';
      if (!charset) return;
      setPassword(Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join(''));
    } finally {
      setLoading(false);
      setCopied(false);
    }
  }, [length, uppercase, lowercase, numbers, symbols]);

  async function copy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const strength = (uppercase ? 1 : 0) + (lowercase ? 1 : 0) + (numbers ? 1 : 0) + (symbols ? 1 : 0) + (length >= 16 ? 1 : 0);
  const [strengthLabel, strengthColor] =
    strength <= 2 ? ['Weak', 'bg-red-400'] :
    strength <= 3 ? ['Fair', 'bg-orange-400'] :
    strength === 4 ? ['Strong', 'bg-emerald-500'] :
                     ['Very strong', 'bg-green-500'];

  const options = [
    { label: 'Uppercase  A–Z', value: uppercase, set: setUppercase },
    { label: 'Lowercase  a–z', value: lowercase, set: setLowercase },
    { label: 'Numbers  0–9',   value: numbers,   set: setNumbers },
    { label: 'Symbols  !@#$',  value: symbols,   set: setSymbols },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <KeyRound size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Password Generator</h1>
            <p className="text-sm text-gray-500">Create a strong, secure password instantly</p>
          </div>
        </div>

        {/* Password display */}
        <div className="relative mb-2">
          <div className="w-full border border-gray-200 rounded-lg px-4 py-3.5 bg-gray-50 font-mono text-base text-gray-800 min-h-[52px] pr-24 break-all">
            {password || <span className="text-gray-400 font-sans text-sm">Click generate below…</span>}
          </div>
          {password && (
            <button
              onClick={copy}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? <><Check size={13} className="text-green-600" /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          )}
        </div>

        {/* Strength bar */}
        {password && (
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${strengthColor} rounded-full transition-all duration-300`} style={{ width: `${(strength / 5) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-20 text-right">{strengthLabel}</span>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {/* Length slider */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Password length</span>
              <span className="font-mono font-semibold text-gray-900">{length}</span>
            </div>
            <input
              type="range" min={8} max={64} value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-2">
            {options.map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer border border-gray-200 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox" checked={value}
                  onChange={(e) => set(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={loading || (!uppercase && !lowercase && !numbers && !symbols)}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generating…' : 'Generate Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
