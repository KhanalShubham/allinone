'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Rates {
  [currency: string]: number;
}

interface RatesResponse {
  rates: Rates;
  timestamp?: number;
  updated?: string;
}

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'NPR', flag: '🇳🇵', name: 'Nepali Rupee' },
  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'CNY', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'KRW', flag: '🇰🇷', name: 'South Korean Won' },
  { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar' },
];

function currencyLabel(code: string) {
  const c = CURRENCIES.find((x) => x.code === code);
  return c ? `${c.flag} ${c.code}` : code;
}

export default function CurrencyConverterPage() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [updatedAt, setUpdatedAt] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NPR');
  const [amount, setAmount] = useState('1');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/currency/rates?base=USD`)
      .then((r) => r.json())
      .then((data: RatesResponse) => {
        setRates(data.rates);
        if (data.timestamp) {
          setUpdatedAt(new Date(data.timestamp * 1000).toLocaleString());
        } else if (data.updated) {
          setUpdatedAt(new Date(data.updated).toLocaleString());
        }
      })
      .catch(() => setError('Failed to load exchange rates'));
  }, []);

  const convert = useCallback((amt: string, from: string, to: string) => {
    if (!rates || !amt) return '';
    const num = parseFloat(amt);
    if (isNaN(num)) return '';
    const fromRate = rates[from] ?? 1;
    const toRate = rates[to] ?? 1;
    const result = (num / fromRate) * toRate;
    return result >= 1000
      ? result.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : result.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [rates]);

  function swap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  const converted = convert(amount, fromCurrency, toCurrency);

  const exchangeRate = rates
    ? ((rates[toCurrency] ?? 1) / (rates[fromCurrency] ?? 1)).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md">
            <ArrowLeftRight size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Currency Converter</h1>
            <p className="text-sm text-gray-500">Live exchange rates for world currencies</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {!rates && !error && (
            <p className="text-sm text-gray-500 text-center py-4">Loading exchange rates…</p>
          )}

          {rates && (
            <>
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={0}
                  step="any"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-base"
                />
              </div>

              {/* Currency selectors */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">From</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={swap}
                  className="mt-6 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors shrink-0"
                >
                  <ArrowLeftRight size={16} />
                </button>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">To</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-600 mb-1">
                  {amount || '0'} {currencyLabel(fromCurrency)} =
                </p>
                <p className="text-4xl font-bold text-blue-700">
                  {converted || '—'}
                </p>
                <p className="text-lg font-semibold text-blue-500 mt-1">{currencyLabel(toCurrency)}</p>
              </div>

              {/* Exchange rate */}
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Exchange rate</span>
                  <span className="font-semibold text-gray-900">1 {fromCurrency} = {exchangeRate} {toCurrency}</span>
                </div>
                {updatedAt && (
                  <div className="flex justify-between py-2">
                    <span>Last updated</span>
                    <span className="font-medium text-gray-700">{updatedAt}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
