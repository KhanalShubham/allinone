'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Cake, CalendarDays, Clock, Star, Gift, Hourglass } from 'lucide-react';

function calcAge(dob: Date, today: Date) {
  let years  = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth()    - dob.getMonth();
  let days   = today.getDate()     - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

function nextBirthday(dob: Date, today: Date) {
  const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  const next     = thisYear <= today
    ? new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate())
    : thisYear;
  const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { date: next, daysLeft: diff };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const result = useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob + 'T00:00:00');
    if (isNaN(birth.getTime()) || birth >= today) return null;

    const age         = calcAge(birth, today);
    const totalDays   = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks  = Math.floor(totalDays / 7);
    const totalMonths = age.years * 12 + age.months;
    const totalHours  = totalDays * 24;
    const bornOn      = DAY_NAMES[birth.getDay()];
    const bornMonth   = MONTH_NAMES[birth.getMonth()];
    const nb          = nextBirthday(birth, today);
    const isBirthday  = nb.daysLeft === 365 || nb.daysLeft === 366;

    return { age, totalDays, totalWeeks, totalMonths, totalHours, bornOn, bornMonth, birth, nb, isBirthday };
  }, [dob, today]);

  const maxDate = today.toISOString().split('T')[0];

  const statCards = result ? [
    { icon: CalendarDays, label: 'Years',    value: result.age.years,               color: 'from-cyan-400 to-blue-600' },
    { icon: Clock,        label: 'Months',   value: result.totalMonths,             color: 'from-violet-400 to-indigo-600' },
    { icon: Hourglass,    label: 'Weeks',    value: result.totalWeeks.toLocaleString(), color: 'from-emerald-400 to-teal-600' },
    { icon: Star,         label: 'Days',     value: result.totalDays.toLocaleString(), color: 'from-amber-400 to-orange-500' },
  ] : [];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md">
            <Cake size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Age Calculator</h1>
            <p className="text-sm text-gray-500">Enter your birthday to see your exact age</p>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Date input */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={maxDate}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />

          {dob && !result && (
            <p className="mt-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              Please enter a valid past date.
            </p>
          )}
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Birthday banner */}
            {result.isBirthday && (
              <div className="mx-6 mb-4 bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <Gift size={18} className="text-pink-500 shrink-0" />
                <span className="text-sm font-medium text-pink-700">Happy Birthday! 🎉</span>
              </div>
            )}

            {/* Exact age */}
            <div className="mx-6 mb-5 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-center">
              <p className="text-sm text-blue-600 font-medium mb-1">Your exact age</p>
              <p className="text-3xl font-bold text-blue-700">
                {result.age.years} <span className="text-lg font-semibold">yrs</span>{' '}
                {result.age.months} <span className="text-lg font-semibold">mo</span>{' '}
                {result.age.days} <span className="text-lg font-semibold">days</span>
              </p>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 mx-6 mb-5">
              {statCards.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3 bg-gray-50">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 leading-tight">{value}</div>
                    <div className="text-xs text-gray-500">{label} old</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fun facts */}
            <div className="mx-6 mb-6 space-y-2">
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CalendarDays size={15} className="text-gray-400" /> Born on a
                </span>
                <span className="text-sm font-semibold text-gray-900">{result.bornOn}, {result.bornMonth} {result.birth.getDate()}, {result.birth.getFullYear()}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock size={15} className="text-gray-400" /> Hours lived
                </span>
                <span className="text-sm font-semibold text-gray-900">{result.totalHours.toLocaleString()}+ hours</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Gift size={15} className="text-gray-400" /> Next birthday
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {result.isBirthday ? 'Today! 🎂' : `In ${result.nb.daysLeft} days`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
