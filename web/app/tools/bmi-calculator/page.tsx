'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Weight } from 'lucide-react';

type Unit = 'metric' | 'imperial';

interface BmiCategory {
  label: string;
  color: string;
  bg: string;
  border: string;
  min: number;
  max: number;
}

const CATEGORIES: BmiCategory[] = [
  { label: 'Underweight', color: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-200',  min: 0,    max: 18.5 },
  { label: 'Normal',      color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200', min: 18.5, max: 25   },
  { label: 'Overweight',  color: 'text-yellow-600',bg: 'bg-yellow-50', border: 'border-yellow-200',min: 25,   max: 30   },
  { label: 'Obese',       color: 'text-red-600',   bg: 'bg-red-50',    border: 'border-red-200',   min: 30,   max: 100  },
];

function getCategory(bmi: number): BmiCategory {
  return CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ?? CATEGORIES[CATEGORIES.length - 1];
}

// Marker position as % (clamp between 5–85 of scale range 10–45)
function markerPct(bmi: number): number {
  const MIN = 10, MAX = 45;
  return Math.min(95, Math.max(2, ((bmi - MIN) / (MAX - MIN)) * 100));
}

export default function BmiCalculatorPage() {
  const [unit, setUnit] = useState<Unit>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

  const bmi = useMemo(() => {
    if (unit === 'metric') {
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100;
      if (!w || !h || w <= 0 || h <= 0) return null;
      return w / (h * h);
    } else {
      const w = parseFloat(weightLbs);
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const totalInches = ft * 12 + inches;
      if (!w || !totalInches || w <= 0 || totalInches <= 0) return null;
      return (w / (totalInches * totalInches)) * 703;
    }
  }, [unit, weight, height, weightLbs, heightFt, heightIn]);

  const category = bmi !== null ? getCategory(bmi) : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-md">
            <Weight size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BMI Calculator</h1>
            <p className="text-sm text-gray-500">Check your Body Mass Index and health category</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Unit toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(['metric', 'imperial'] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  unit === u ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Inputs */}
          {unit === 'metric' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min={1} placeholder="70"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min={1} placeholder="170"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                <input type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} min={1} placeholder="154"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (ft)</label>
                <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} min={1} placeholder="5"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (in)</label>
                <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} min={0} max={11} placeholder="7"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          )}

          {/* Result */}
          {bmi !== null && category ? (
            <>
              <div className={`${category.bg} ${category.border} border rounded-xl px-5 py-4 text-center`}>
                <p className={`text-sm font-medium ${category.color} mb-1`}>Your BMI</p>
                <p className={`text-4xl font-bold ${category.color}`}>{bmi.toFixed(1)}</p>
                <p className={`text-base font-semibold mt-1 ${category.color}`}>{category.label}</p>
              </div>

              {/* Scale bar */}
              <div>
                <div className="relative h-4 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-blue-300" />
                  <div className="flex-1 bg-green-400" />
                  <div className="flex-1 bg-yellow-400" />
                  <div className="flex-1 bg-red-400" />
                </div>
                <div className="relative h-3 mt-1">
                  <div
                    className="absolute top-0 w-0.5 h-3 bg-gray-800 rounded-full"
                    style={{ left: `${markerPct(bmi)}%`, transform: 'translateX(-50%)' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                </div>
              </div>

              {/* Category table */}
              <div className="space-y-1">
                {CATEGORIES.map((c) => (
                  <div key={c.label} className={`flex justify-between items-center px-3 py-1.5 rounded-lg text-xs ${c.label === category.label ? `${c.bg} font-semibold ${c.color}` : 'text-gray-500'}`}>
                    <span>{c.label}</span>
                    <span>BMI {c.min === 0 ? '< 18.5' : c.max === 100 ? '≥ 30' : `${c.min} – ${c.max}`}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center">This is for informational purposes only, not medical advice.</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Enter your weight and height to see your BMI.</p>
          )}
        </div>
      </div>
    </div>
  );
}
