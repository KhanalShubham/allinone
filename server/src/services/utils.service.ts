import crypto from 'crypto';

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export function generatePassword(opts: PasswordOptions): string {
  let charset = '';
  if (opts.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.numbers) charset += '0123456789';
  if (opts.symbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (!charset) throw new Error('Select at least one character type');

  return Array.from(crypto.randomBytes(opts.length))
    .map((b) => charset[b % charset.length])
    .join('');
}
