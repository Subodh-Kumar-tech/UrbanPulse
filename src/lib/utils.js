import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path) {
  if (!path) return 'https://picsum.photos/seed/new/500/300';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
}
