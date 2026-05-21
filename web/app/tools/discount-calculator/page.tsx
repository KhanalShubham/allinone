'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';

export default function DiscountCalculatorPage() {
  const [original, setOriginal] = useState('');
  const [discount, setDiscount] = useState(20);
  // Reverse section
  const [revOriginal, setRevOriginal] = useState('');
  const [revFinal, setRevFinal] = useState('');

  const result = useMemo(() => {
    const O = parseFloat(original);
    if (!O || O <= 0) return null;
    const saved = (O * discount) / 100;
    const final = O - saved;
    return { saved, final };
  }, [original, discount]);

  const reverseResult = useMemo(() => {
    const O = parseFloat(revOriginal);
    const F = parseFloat(revFinal);
    if (!O || !F || O <= 0 || F <= 0 || F >= O) return null;
    return Math.round(((O - F) / O) * 100 * 10) / 10;
  }, [revOriginal, revFinal]);

  function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-md">
            <Tag size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Discount Calculator</h1>
            <p className="text-sm text-gray-500">Find the final price after any percentage discount</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Original price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ($)</label>
            <input
              type="number"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              min={0}
              placeholder="e.g. 199.99"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Discount slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Discount</label>
              <span className="text-sm font-semibold text-orange-600">{discount}% OFF</span>
            </div>
            <input
              type="range"
              min={0} max={90} step={1}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>90%</span>
            </div>
          </div>

          {/* Results */}
          {result ? (
            <div className="space-y-3">
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-5 py-4 text-center">
                <p className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-1">You Save</p>
                <p className="text-3xl font-bold text-orange-600">${fmt(result.saved)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Original Price</p>
                  <p className="text-base font-semibold text-gray-600 line-through">${fmt(parseFloat(original))}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600 mb-1">Final Price</p>
                  <p className="text-lg font-bold text-green-700">${fmt(result.final)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Enter a price to see results.</p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">What % Off? (Reverse)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Original Price</label>
                <input
                  type="number"
                  value={revOriginal}
                  onChange={(e) => setRevOriginal(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Final Price</label>
                <input
                  type="number"
                  value={revFinal}
                  onChange={(e) => setRevFinal(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {reverseResult !== null && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center">
                <p className="text-sm text-blue-600 font-medium">Discount applied</p>
                <p className="text-2xl font-bold text-blue-700">{reverseResult}% OFF</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
