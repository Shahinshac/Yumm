import { useState, useEffect, useRef } from 'react';

/**
 * useMarkerAnimation - Smoothly interpolates between coordinates
 * @param {Array} position - [lat, lng]
 * @param {number} duration - animation duration in ms
 */
const useMarkerAnimation = (position, duration = 1000) => {
  const [animatedPos, setAnimatedPos] = useState(position);
  const positionRef = useRef(position);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!position || (position[0] === positionRef.current[0] && position[1] === positionRef.current[1])) {
        return;
    }

    const startPos = [...positionRef.current];
    const endPos = [...position];
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Simple linear interpolation
      const lat = startPos[0] + (endPos[0] - startPos[0]) * progress;
      const lng = startPos[1] + (endPos[1] - startPos[1]) * progress;

      const currentPos = [lat, lng];
      setAnimatedPos(currentPos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        positionRef.current = endPos;
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [position, duration]);

  return animatedPos;
};

export default useMarkerAnimation;
