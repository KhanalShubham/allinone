'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarClock } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  const total = diff;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, total };
}

export default function EventCountdownPage() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [pctElapsed, setPctElapsed] = useState(0);

  useEffect(() => {
    if (!eventDate) { setTimeLeft(null); return; }
    const target = new Date(eventDate + 'T00:00:00');
    if (isNaN(target.getTime()) || target <= new Date()) { setTimeLeft(null); return; }

    setDayOfWeek(DAY_NAMES[target.getDay()]);

    const now = Date.now();
    const totalSpan = target.getTime() - now;

    const update = () => {
      const tl = calcTimeLeft(target);
      setTimeLeft(tl);
      const elapsed = 1 - tl.total / totalSpan;
      setPctElapsed(Math.min(100, Math.max(0, elapsed * 100)));
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-pink-600 flex items-center justify-center shadow-md">
            <CalendarClock size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Event Countdown</h1>
            <p className="text-sm text-gray-500">Count down the days to any exam, trip or deadline</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Event name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Final Exams, Birthday, Trip to Paris…"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Event date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              min={minDateStr}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Countdown display */}
          {timeLeft ? (
            <>
              {/* Big countdown */}
              <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 rounded-2xl px-5 py-6">
                {eventName && (
                  <p className="text-center text-sm font-semibold text-violet-600 mb-4">
                    Until {eventName}
                  </p>
                )}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { value: timeLeft.days,    label: 'Days' },
                    { value: timeLeft.hours,   label: 'Hours' },
                    { value: timeLeft.minutes, label: 'Mins' },
                    { value: timeLeft.seconds, label: 'Secs' },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-white border border-violet-100 rounded-xl py-3">
                      <div className="text-2xl font-bold text-violet-800 font-mono">
                        {String(value).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-violet-400 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day of week */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-sm text-gray-600">Event falls on</span>
                <span className="text-sm font-semibold text-gray-900">{dayOfWeek}</span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Time elapsed towards event</span>
                  <span className="text-xs font-semibold text-violet-600">{pctElapsed.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${pctElapsed}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Pick a future date to start counting down.</p>
          )}
        </div>
      </div>
    </div>
  );
}
