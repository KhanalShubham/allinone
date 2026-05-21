'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator } from 'lucide-react';

export default function LoanCalculatorPage() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('8.5');
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    const P = parseFloat(principal);
    const r = parseFloat(rate);
    if (!P || !r || P <= 0 || r <= 0 || years <= 0) return null;
    const monthly_rate = r / 12 / 100;
    const n = years * 12;
    const emi = (P * monthly_rate * Math.pow(1 + monthly_rate, n)) / (Math.pow(1 + monthly_rate, n) - 1);
    const total = emi * n;
    const interest = total - P;
    return {
      emi,
      total,
      interest,
      principalPct: Math.round((P / total) * 100),
      interestPct: Math.round((interest / total) * 100),
    };
  }, [principal, rate, years]);

  function fmt(n: number) {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-md">
            <Calculator size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Loan / EMI Calculator</h1>
            <p className="text-sm text-gray-500">Calculate monthly payments and total interest for any loan</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Loan amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount (₹)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              min={1}
              placeholder="e.g. 500000"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Interest Rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min={0.1} max={50} step={0.1}
              placeholder="e.g. 8.5"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Term slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Loan Term</label>
              <span className="text-sm font-semibold text-blue-600">{years} year{years !== 1 ? 's' : ''}</span>
            </div>
            <input
              type="range"
              min={1} max={30} step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 yr</span><span>30 yrs</span>
            </div>
          </div>

          {/* Results */}
          {result ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-500 font-medium mb-1">Monthly EMI</p>
                  <p className="text-lg font-bold text-blue-700">₹{fmt(result.emi)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Total Payment</p>
                  <p className="text-lg font-bold text-emerald-700">₹{fmt(result.total)}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-500 font-medium mb-1">Total Interest</p>
                  <p className="text-lg font-bold text-red-600">₹{fmt(result.interest)}</p>
                </div>
              </div>

              {/* Breakdown bar */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown</p>
                <div className="flex rounded-full overflow-hidden h-4">
                  <div className="bg-blue-500 h-full" style={{ width: `${result.principalPct}%` }} />
                  <div className="bg-red-400 h-full" style={{ width: `${result.interestPct}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" /> Principal {result.principalPct}%</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-400" /> Interest {result.interestPct}%</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Enter loan details to see results.</p>
          )}
        </div>
      </div>
    </div>
  );
}
