'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Timer, Play, Pause, RotateCcw } from 'lucide-react';

type Mode = 'pomodoro' | 'short' | 'long';

const MODES: { id: Mode; label: string; seconds: number; accent: string; bg: string; border: string; text: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro',    seconds: 25 * 60, accent: 'bg-red-600 hover:bg-red-700',   bg: 'bg-red-50',   border: 'border-red-100',   text: 'text-red-700'   },
  { id: 'short',    label: 'Short Break', seconds: 5 * 60,  accent: 'bg-green-600 hover:bg-green-700', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700' },
  { id: 'long',     label: 'Long Break',  seconds: 15 * 60, accent: 'bg-blue-600 hover:bg-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-100',  text: 'text-blue-700'  },
];

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  } catch {
    // AudioContext not available in some environments
  }
}

export default function PomodoroTimerPage() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentMode = MODES.find((m) => m.id === mode)!;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stop();
            setRunning(false);
            playBeep();
            if (mode === 'pomodoro') setPomodoros((p) => p + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stop();
    }
    return stop;
  }, [running, mode, stop]);

  function switchMode(m: Mode) {
    stop();
    setRunning(false);
    setMode(m);
    setTimeLeft(MODES.find((x) => x.id === m)!.seconds);
  }

  function reset() {
    stop();
    setRunning(false);
    setTimeLeft(currentMode.seconds);
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const pct = 1 - timeLeft / currentMode.seconds;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
            <Timer size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pomodoro Timer</h1>
            <p className="text-sm text-gray-500">Focus for 25 minutes, break for 5 — boost productivity</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Mode tabs */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  mode === m.id ? `${m.accent} text-white` : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timer display */}
          <div className={`${currentMode.bg} ${currentMode.border} border rounded-2xl py-10 flex flex-col items-center gap-4`}>
            <div className={`text-7xl font-bold font-mono tracking-tight ${currentMode.text}`}>{mm}:{ss}</div>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  mode === 'pomodoro' ? 'bg-red-500' : mode === 'short' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <p className={`text-sm font-medium ${currentMode.text}`}>{currentMode.label}</p>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              className={`flex-1 flex items-center justify-center gap-2 ${currentMode.accent} text-white rounded-lg py-2.5 text-sm font-semibold transition-colors`}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? 'Pause' : timeLeft === currentMode.seconds ? 'Start' : 'Resume'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Pomodoro count */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-600">Completed today</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: Math.max(pomodoros, 4) }, (_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < pomodoros ? 'bg-red-500' : 'bg-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-800">{pomodoros} 🍅</span>
            </div>
          </div>

          {pomodoros > 0 && pomodoros % 4 === 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium text-center">
              You&apos;ve completed 4 pomodoros! Time for a long break.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
