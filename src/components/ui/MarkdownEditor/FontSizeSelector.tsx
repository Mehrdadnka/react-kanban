// src/components/ui/MarkdownEditor/FontSizeSelector.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';

interface FontSizeSelectorProps {
  editor: Editor;
  isDarkMode?: boolean;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '36px'];

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  editor,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSize =
    editor.getAttributes('textStyle').fontSize || '16px';

const handleSelect = (size: string) => {
  editor
    .chain()
    .focus()
    .setMark('textStyle', { fontSize: size })
    .run();
};

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded transition-colors min-w-[48px]',
          isDarkMode
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        )}
        title="Font Size"
      >
        <AlignLeft size={16} />
        <span className="text-xs font-medium">{currentSize.replace('px', '')}</span>
        <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 py-1 rounded-lg shadow-xl border z-50 w-32 max-h-64 overflow-y-auto',
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          )}
        >
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleSelect(size)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2',
                currentSize === size
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <span className="text-gray-400 text-xs w-6 text-right">
                {currentSize === size ? '✓' : ''}
              </span>
              <span style={{ fontSize: size }}>{size.replace('px', '')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};