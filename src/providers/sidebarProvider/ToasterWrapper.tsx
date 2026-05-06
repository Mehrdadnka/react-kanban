import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toaster } from 'sonner';
import { useApp } from '../AppProvider';
import { cn } from '@/lib/utils';

const TOASTER_Z_INDEX = 99999;

const ToasterWrapper: React.FC = memo(() => {
  const { isDarkMode } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div 
      style={{ 
        position: 'fixed',
        zIndex: TOASTER_Z_INDEX,
        pointerEvents: 'none',
        inset: 0
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <Toaster 
          position="bottom-right" 
          richColors
          theme={isDarkMode ? 'dark' : 'light'}
          toastOptions={{
            style: {
              background: isDarkMode ? 'hsl(217 33% 17%)' : 'hsl(0 0% 100%)',
              color: isDarkMode ? 'hsl(213 31% 91%)' : 'hsl(222.2 84% 4.9%)',
              border: isDarkMode 
                ? '1px solid hsl(215 27.9% 16.9%)' 
                : '1px solid hsl(214.3 31.8% 91.4%)',
              boxShadow: isDarkMode 
                ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                : '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius)',
              zIndex: TOASTER_Z_INDEX,
            },
            className: cn(
              'backdrop-blur-md',
              isDarkMode ? 'dark' : ''
            ),
          }}
        />
      </div>
    </div>,
    document.body
  );
});

export default ToasterWrapper;