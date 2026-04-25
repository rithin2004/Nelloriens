import { useEffect, useRef, useState } from 'react';

/**
 * useHorizontalScroll Hook
 * Creates an Amazon-style horizontal scrolling experience with seamless loops,
 * manual drag/swipe support, and auto-drift behavior.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Auto-drift speed in pixels per frame
 * @param {boolean} options.pauseOnInteraction - Whether to pause auto-scroll during interaction
 */
export const useHorizontalScroll = ({ 
  speed = 0.5, 
  pauseOnInteraction = true 
} = {}) => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const requestRef = useRef();
  const lastTimeRef = useRef();

  // Handle auto-drift animation
  const animate = (time) => {
    if (lastTimeRef.current !== undefined) {
      if (!isHovered && (!isInteracting || !pauseOnInteraction)) {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth } = scrollRef.current;
          
          // Move forward
          let newScrollLeft = scrollLeft + speed;
          
          // Seamless loop math
          const scrollEnd = (scrollWidth / 2); // Half because we duplicate items
          if (newScrollLeft >= scrollEnd) {
            newScrollLeft = 0;
          }
          
          scrollRef.current.scrollLeft = newScrollLeft;
        }
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHovered, isInteracting, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Desktop Drag
  const handleMouseDown = (e) => {
    const ele = scrollRef.current;
    if (!ele) return;

    setIsInteracting(true);
    const startX = e.pageX - ele.offsetLeft;
    const scrollLeft = ele.scrollLeft;

    const handleMouseMove = (e) => {
      const x = e.pageX - ele.offsetLeft;
      const walk = (x - startX) * 2; // Scroll multiplier
      ele.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      setIsInteracting(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Mobile Touch
  const handleTouchStart = () => setIsInteracting(true);
  const handleTouchEnd = () => setIsInteracting(false);

  return {
    scrollRef,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    isInteracting
  };
};
