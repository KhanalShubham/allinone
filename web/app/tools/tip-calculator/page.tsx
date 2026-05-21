'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Receipt } from 'lucide-react';

const PRESET_TIPS = [10, 15, 18, 20];

export default function TipCalculatorPage() {
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState<number | ''>( 15);
  const [customTip, setCustomTip] = useState('');
  const [people, setPeople] = useState('1');
  const [useCustom, setUseCustom] = useState(false);

  const effectiveTip = useCustom ? (parseFloat(customTip) || 0) : (tipPct === '' ? 0 : tipPct);

  const result = useMemo(() => {
    const B = parseFloat(bill);
    const P = parseInt(people) || 1;
    if (!B || B <= 0) return null;
    const tipAmt = (B * effectiveTip) / 100;
    const total = B + tipAmt;
    return {
      tipAmt,
      total,
      perPerson: total / P,
      tipPerPerson: tipAmt / P,
    };
  }, [bill, effectiveTip, people]);

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-md">
            <Receipt size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tip Calculator</h1>
            <p className="text-sm text-gray-500">Split a bill and calculate tip per person instantly</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Bill amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Amount ($)</label>
            <input
              type="number"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              min={0}
              placeholder="e.g. 85.00"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tip buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tip Percentage</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_TIPS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => { setTipPct(pct); setUseCustom(false); }}
                  className={`rounded-lg py-2.5 text-sm font-semibold transition-colors border ${
                    !useCustom && tipPct === pct
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseCustom(true)}
                className={`shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors border ${
                  useCustom ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                Custom
              </button>
              <input
                type="number"
                value={customTip}
                onChange={(e) => { setCustomTip(e.target.value); setUseCustom(true); }}
                min={0} max={100} placeholder="Enter %"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Number of people */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of People</label>
            <input
              type="number"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              min={1}
              placeholder="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Results */}
          {result ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 space-y-3">
              {[
                { label: 'Tip Amount', value: `$${fmt(result.tipAmt)}`, sub: parseInt(people) > 1 ? `$${fmt(result.tipPerPerson)} per person` : undefined },
                { label: 'Total Bill', value: `$${fmt(result.total)}`, sub: undefined },
                { label: 'Per Person', value: `$${fmt(result.perPerson)}`, sub: undefined, highlight: true },
              ].map(({ label, value, sub, highlight }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <div className="text-right">
                    <span className={`font-bold ${highlight ? 'text-blue-700 text-lg' : 'text-gray-900 text-base'}`}>{value}</span>
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Enter a bill amount to see results.</p>
          )}
        </div>
      </div>
    </div>
  );
}
