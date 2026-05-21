'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Zap, Menu, X } from 'lucide-react';
import { categories } from '@/lib/tools';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-gray-900">
            <Zap size={20} className="text-blue-600" fill="currentColor" />
            Turuntai
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/#${cat.id}`}
                className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/#${cat.id}`}
              className="flex items-center gap-2 px-2 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
