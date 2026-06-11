import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function renderTextWithCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="font-mono text-sm px-1.5 py-0.5 rounded bg-gray-100 text-gray-700"
        >
          {code}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}
