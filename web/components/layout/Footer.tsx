import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-gray-800">
            <Zap size={16} className="text-blue-600" fill="currentColor" />
            Turuntai
            <span className="font-normal text-gray-400 text-sm ml-1">— Free tools for everyone</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Turuntai. No sign-up needed, always free.
          </p>
        </div>
      </div>
    </footer>
  );
}
