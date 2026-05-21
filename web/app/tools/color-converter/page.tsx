'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, Copy, Check } from 'lucide-react';

/* ── Color math ── */
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/* ── Component ── */
export default function ColorConverterPage() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState<[number, number, number]>([59, 130, 246]);
  const [hsl, setHsl] = useState<[number, number, number]>([217, 91, 60]);
  const [copied, setCopied] = useState('');

  function fromHex(value: string) {
    setHex(value);
    const r = hexToRgb(value);
    if (r) {
      setRgb(r);
      setHsl(rgbToHsl(...r));
    }
  }

  function fromRgb(index: 0 | 1 | 2, raw: string) {
    const val = Math.min(255, Math.max(0, parseInt(raw) || 0));
    const next: [number, number, number] = [...rgb] as [number, number, number];
    next[index] = val;
    setRgb(next);
    setHex(rgbToHex(...next));
    setHsl(rgbToHsl(...next));
  }

  function fromHsl(index: 0 | 1 | 2, raw: string) {
    const max = index === 0 ? 360 : 100;
    const val = Math.min(max, Math.max(0, parseInt(raw) || 0));
    const next: [number, number, number] = [...hsl] as [number, number, number];
    next[index] = val;
    setHsl(next);
    const r = hslToRgb(...next);
    setRgb(r);
    setHex(rgbToHex(...r));
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  const hexStr = hex.startsWith('#') && hex.length === 7 ? hex : rgbToHex(...rgb);
  const rgbStr = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  const hslStr = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-md">
            <Palette size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Color Converter</h1>
            <p className="text-sm text-gray-500">Convert between HEX, RGB and HSL color formats</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Color swatch */}
          <div
            className="w-full h-20 rounded-xl border border-gray-200 shadow-inner"
            style={{ backgroundColor: hexStr }}
          />

          {/* HEX */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">HEX</span>
              <button onClick={() => copy(hexStr, 'hex')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                {copied === 'hex' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'hex' ? 'Copied!' : hexStr}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-mono text-sm">#</span>
              <input
                type="text"
                value={hex.replace('#', '')}
                onChange={(e) => fromHex('#' + e.target.value)}
                maxLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3b82f6"
              />
            </div>
          </div>

          {/* RGB */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">RGB</span>
              <button onClick={() => copy(rgbStr, 'rgb')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                {copied === 'rgb' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'rgb' ? 'Copied!' : rgbStr}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['R', 'G', 'B'] as const).map((label, i) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 mb-1">{label} (0–255)</label>
                  <input
                    type="number"
                    min={0} max={255}
                    value={rgb[i]}
                    onChange={(e) => fromRgb(i as 0 | 1 | 2, e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* HSL */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">HSL</span>
              <button onClick={() => copy(hslStr, 'hsl')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                {copied === 'hsl' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'hsl' ? 'Copied!' : hslStr}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'H', max: 360 }, { label: 'S', max: 100 }, { label: 'L', max: 100 }].map(({ label, max }, i) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 mb-1">{label} (0–{max})</label>
                  <input
                    type="number"
                    min={0} max={max}
                    value={hsl[i]}
                    onChange={(e) => fromHsl(i as 0 | 1 | 2, e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
