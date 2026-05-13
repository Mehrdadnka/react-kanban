// src/components/WebGLFallback.tsx
import React from 'react';

export const WebGLFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Check WebGL support
    const checkWebGL = () => {
      if (typeof window === 'undefined') return false;
      
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    };

    setWebglSupported(checkWebGL());
  }, []);

  // Still checking
  if (webglSupported === null) {
    return <div>Loading...</div>;
  }

  // If WebGL is not supported, show a message
  if (!webglSupported) {
    return (
      <div className="webgl-fallback">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">⚠️ Hardware Limitation</h3>
          <p className="text-sm text-yellow-700 mt-1">
            3D features are not supported on this device. 
            All other application features will work normally.
          </p>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};