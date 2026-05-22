import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Spaja Tailwind klase pametno (dedupe konfliktnih klasa). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
