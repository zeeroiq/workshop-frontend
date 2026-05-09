import { useState, useEffect } from 'react';

export function useWindowSize() {
  const isClient = typeof window === 'object';
  const [windowSize, setWindowSize] = useState({
    width: isClient ? window.innerWidth : 0,
    height: isClient ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (!isClient) return;
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  return windowSize;
}

export function useIsMobile(breakpoint = 768) {
  const { width } = useWindowSize();
  return width && width < breakpoint;
}
