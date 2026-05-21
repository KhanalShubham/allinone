export type { Tool, Category } from '@/types';
import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'media',
    name: 'Media Tools',
    icon: 'Clapperboard',
    gradient: 'from-red-400 to-orange-500',
    tools: [
      { id: 'youtube-mp3', name: 'YouTube to MP3', description: 'Save audio from any YouTube video as an MP3 file', icon: 'Music', gradient: 'from-red-500 to-rose-600', href: '/tools/youtube-mp3', badge: 'popular', available: true },
      { id: 'youtube-mp4', name: 'YouTube to MP4', description: 'Download YouTube videos in full HD quality', icon: 'Video', gradient: 'from-orange-400 to-red-500', href: '/tools/youtube-mp4', badge: 'popular', available: true },
      { id: 'gif-maker', name: 'GIF Maker', description: 'Turn any video clip into a shareable GIF', icon: 'Film', gradient: 'from-pink-400 to-purple-500', href: '/tools/gif-maker', available: true },
      { id: 'thumbnail-downloader', name: 'Thumbnail Downloader', description: 'Save the thumbnail image from any YouTube video', icon: 'ImageDown', gradient: 'from-amber-400 to-orange-500', href: '/tools/thumbnail-downloader', available: true },
    ],
  },
  {
    id: 'image',
    name: 'Image Tools',
    icon: 'Image',
    gradient: 'from-blue-400 to-cyan-500',
    tools: [
      { id: 'image-compressor', name: 'Image Compressor', description: 'Shrink image file size without losing visible quality', icon: 'Minimize2', gradient: 'from-emerald-400 to-teal-600', href: '/tools/image-compressor', badge: 'popular', available: true },
      { id: 'background-remover', name: 'Background Remover', description: 'Automatically remove the background from any photo', icon: 'Scissors', gradient: 'from-violet-500 to-purple-700', href: '/tools/background-remover', badge: 'ai', available: true },
      { id: 'image-resizer', name: 'Image Resizer', description: 'Change image width and height to any size', icon: 'Maximize2', gradient: 'from-sky-400 to-blue-600', href: '/tools/image-resizer', available: true },
      { id: 'image-converter', name: 'Format Converter', description: 'Convert images between JPG, PNG, WebP and more', icon: 'RefreshCw', gradient: 'from-cyan-400 to-sky-600', href: '/tools/image-converter', available: true },
    ],
  },
  {
    id: 'ai',
    name: 'AI Tools',
    icon: 'Sparkles',
    gradient: 'from-violet-500 to-indigo-600',
    tools: [
      { id: 'ai-summarizer', name: 'AI Summarizer', description: 'Paste any long article and get a short summary', icon: 'BookOpen', gradient: 'from-violet-400 to-indigo-600', href: '/tools/ai-summarizer', badge: 'ai', available: true },
      { id: 'grammar-fixer', name: 'Grammar Fixer', description: 'Fix grammar, spelling, and punctuation instantly', icon: 'SpellCheck', gradient: 'from-green-400 to-emerald-600', href: '/tools/grammar-fixer', badge: 'ai', available: true },
      { id: 'rewrite-text', name: 'Rewrite Text', description: 'Rephrase any text in a more professional tone', icon: 'PenLine', gradient: 'from-indigo-400 to-violet-600', href: '/tools/rewrite-text', badge: 'ai', available: true },
    ],
  },
  {
    id: 'student',
    name: 'Student Tools',
    icon: 'GraduationCap',
    gradient: 'from-green-400 to-teal-500',
    tools: [
      { id: 'pdf-merge', name: 'PDF Merge', description: 'Combine two or more PDF files into one document', icon: 'FilePlus', gradient: 'from-blue-500 to-indigo-600', href: '/tools/pdf-merge', badge: 'popular', available: true },
      { id: 'pdf-to-word', name: 'PDF to Text', description: 'Extract text from a PDF to paste into Word or other editors', icon: 'FileType', gradient: 'from-sky-400 to-blue-600', href: '/tools/pdf-to-word', available: true },
      { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters and estimate reading time', icon: 'AlignLeft', gradient: 'from-yellow-400 to-orange-500', href: '/tools/word-counter', badge: 'new', available: true },
      { id: 'ocr', name: 'Image to Text (OCR)', description: 'Extract typed or handwritten text from any image', icon: 'ScanText', gradient: 'from-amber-400 to-orange-600', href: '/tools/ocr', available: true },
      { id: 'case-converter', name: 'Case Converter', description: 'Convert text to UPPER, lower, Title or Sentence case', icon: 'CaseSensitive', gradient: 'from-sky-400 to-blue-600', href: '/tools/case-converter', badge: 'new', available: true },
    ],
  },
  {
    id: 'utilities',
    name: 'Daily Utilities',
    icon: 'Wrench',
    gradient: 'from-rose-400 to-red-600',
    tools: [
      { id: 'qr-generator', name: 'QR Code Generator', description: 'Create a scannable QR code for any link or text', icon: 'QrCode', gradient: 'from-violet-500 to-indigo-700', href: '/tools/qr-generator', badge: 'popular', available: true },
      { id: 'password-generator', name: 'Password Generator', description: 'Generate a strong, random password in one click', icon: 'KeyRound', gradient: 'from-pink-400 to-red-600', href: '/tools/password-generator', badge: 'new', available: true },
      { id: 'currency-converter', name: 'Currency Converter', description: 'Convert between any two world currencies live', icon: 'ArrowLeftRight', gradient: 'from-amber-400 to-orange-600', href: '/tools/currency-converter', available: true },
      { id: 'age-calculator', name: 'Age Calculator', description: 'Enter your birthday and see your exact age today', icon: 'Cake', gradient: 'from-cyan-400 to-blue-600', href: '/tools/age-calculator', badge: 'new', available: true },
    ],
  },
  {
    id: 'social',
    name: 'Social Media',
    icon: 'Share2',
    gradient: 'from-pink-400 to-purple-600',
    tools: [
      { id: 'tiktok-downloader', name: 'TikTok Downloader', description: 'Download TikTok videos without a watermark', icon: 'Music2', gradient: 'from-gray-700 to-gray-900', href: '/tools/tiktok-downloader', available: true },
      { id: 'hashtag-generator', name: 'Hashtag Generator', description: 'Find the best hashtags for your post or niche', icon: 'Hash', gradient: 'from-blue-400 to-indigo-600', href: '/tools/hashtag-generator', badge: 'ai', available: true },
      { id: 'link-shortener', name: 'Link Shortener', description: 'Turn any long URL into a short, clean link', icon: 'Link', gradient: 'from-teal-400 to-cyan-600', href: '/tools/link-shortener', available: true },
    ],
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    icon: 'Code2',
    gradient: 'from-slate-500 to-gray-700',
    tools: [
      { id: 'base64', name: 'Base64 Encode/Decode', description: 'Encode or decode any text using Base64', icon: 'Binary', gradient: 'from-slate-500 to-gray-700', href: '/tools/base64', available: true },
      { id: 'json-formatter', name: 'JSON Formatter', description: 'Paste messy JSON and get it clean and readable', icon: 'Braces', gradient: 'from-green-500 to-emerald-700', href: '/tools/json-formatter', available: true },
      { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB and HSL color formats', icon: 'Palette', gradient: 'from-rose-400 to-pink-600', href: '/tools/color-converter', available: true },
      { id: 'url-encoder', name: 'URL Encoder/Decoder', description: 'Encode or decode URLs and query strings', icon: 'Link2', gradient: 'from-blue-500 to-indigo-700', href: '/tools/url-encoder', available: true },
      { id: 'hash-generator', name: 'Hash Generator', description: 'Generate SHA-256 or MD5 hash from any text', icon: 'Hash', gradient: 'from-gray-600 to-gray-800', href: '/tools/hash-generator', available: true },
      { id: 'timestamp-converter', name: 'Timestamp Converter', description: 'Convert Unix timestamps to readable dates', icon: 'Timer', gradient: 'from-violet-400 to-purple-600', href: '/tools/timestamp-converter', available: true },
    ],
  },
  {
    id: 'finance',
    name: 'Finance Tools',
    icon: 'IndianRupee',
    gradient: 'from-emerald-500 to-green-700',
    tools: [
      { id: 'loan-calculator', name: 'Loan / EMI Calculator', description: 'Calculate monthly payments and total interest for any loan', icon: 'Calculator', gradient: 'from-emerald-500 to-green-700', href: '/tools/loan-calculator', badge: 'popular', available: true },
      { id: 'tip-calculator', name: 'Tip Calculator', description: 'Split a bill and calculate tip per person instantly', icon: 'Receipt', gradient: 'from-teal-400 to-emerald-600', href: '/tools/tip-calculator', available: true },
      { id: 'discount-calculator', name: 'Discount Calculator', description: 'Find the final price after any percentage discount', icon: 'Tag', gradient: 'from-orange-400 to-amber-600', href: '/tools/discount-calculator', available: true },
    ],
  },
  {
    id: 'health',
    name: 'Health & Lifestyle',
    icon: 'HeartPulse',
    gradient: 'from-red-400 to-rose-600',
    tools: [
      { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Check your Body Mass Index and health category', icon: 'Weight', gradient: 'from-red-400 to-rose-600', href: '/tools/bmi-calculator', badge: 'popular', available: true },
      { id: 'pomodoro-timer', name: 'Pomodoro Timer', description: 'Focus for 25 minutes, break for 5 — boost productivity', icon: 'TimerIcon', gradient: 'from-orange-400 to-red-500', href: '/tools/pomodoro-timer', badge: 'new', available: true },
      { id: 'event-countdown', name: 'Event Countdown', description: 'Count down the days to any exam, trip or deadline', icon: 'CalendarClock', gradient: 'from-violet-400 to-pink-600', href: '/tools/event-countdown', badge: 'new', available: true },
    ],
  },
];

export const allTools = categories.flatMap((c) => c.tools);
