import { useState, useEffect } from 'react';

/**
 * Custom hook for media query matching
 * Returns true/false based on whether media query matches
 *
 * @param {string} query - Media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener
    const handleChange = (e) => {
      setMatches(e.matches);
    };

    // Add listener (use addEventListener for better browser support)
    mediaQuery.addListener(handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
