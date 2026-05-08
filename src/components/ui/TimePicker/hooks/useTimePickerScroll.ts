import { useRef, useState, useCallback, useEffect, useMemo } from 'react';

interface UseTimePickerScrollOptions {
  items: number[];
  selectedIndex: number;
  itemHeight: number;
  visibleItems?: number;
  onChange: (index: number) => void;
  disabled?: boolean;
  padZero?: boolean;
  formatLabel?: (item: number) => string;
}

interface DragState {
  startY: number;
  startScrollTop: number;
  velocity: number;
  lastY: number;
  lastTime: number;
  animationFrame: number | null;
}

export const useTimePickerScroll = ({
  items,
  selectedIndex,
  itemHeight,
  visibleItems = 7,
  onChange,
  disabled = false,
  padZero = true,
  formatLabel,
}: UseTimePickerScrollOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  
  const dragState = useRef<DragState>({
    startY: 0,
    startScrollTop: 0,
    velocity: 0,
    lastY: 0,
    lastTime: 0,
    animationFrame: null,
  });

  const totalHeight = items.length * itemHeight;
  const containerHeight = visibleItems * itemHeight;
  const halfVisible = Math.floor(visibleItems / 2);
  
  const targetOffset = useMemo(() => {
    return selectedIndex * itemHeight - halfVisible * itemHeight;
  }, [selectedIndex, itemHeight, halfVisible]);

  const snapToIndex = useCallback(
    (offset: number): { index: number; offset: number } => {
      const rawIndex = (offset + halfVisible * itemHeight) / itemHeight;
      const clampedIndex = Math.max(0, Math.min(items.length - 1, Math.round(rawIndex)));
      const snappedOffset = clampedIndex * itemHeight - halfVisible * itemHeight;
      return { index: clampedIndex, offset: snappedOffset };
    },
    [items.length, itemHeight, halfVisible]
  );

  const visibleRange = useMemo(() => {
    const centerOffset = scrollOffset + containerHeight / 2;
    const centerIndex = Math.floor(centerOffset / itemHeight);
    
    const start = Math.max(0, centerIndex - halfVisible - 1);
    const end = Math.min(items.length, centerIndex + halfVisible + 2);
    
    return { start, end };
  }, [scrollOffset, containerHeight, itemHeight, halfVisible, items.length]);

  const virtualItems = useMemo(() => {
    const result: Array<{
      index: number;
      value: number;
      label: string;
      offset: number;
      isSelected: boolean;
      opacity: number;
      scale: number;
    }> = [];

    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const itemOffset = i * itemHeight;
      const relativeOffset = itemOffset - scrollOffset;
      const centerDistance = Math.abs(relativeOffset - containerHeight / 2 + itemHeight / 2);
      const maxDistance = containerHeight / 2;
      
      const normalizedDistance = Math.min(centerDistance / maxDistance, 1);
      const opacity = 1 - normalizedDistance * 0.7;
      const scale = 1 - normalizedDistance * 0.2; 
      
      result.push({
        index: i,
        value: items[i],
        label: formatLabel 
          ? formatLabel(items[i]) 
          : padZero ? String(items[i]).padStart(2, '0') : String(items[i]),
        offset: relativeOffset,
        isSelected: i === selectedIndex,
        opacity,
        scale,
      });
    }

    return result;
  }, [visibleRange, items, scrollOffset, itemHeight, containerHeight, selectedIndex, padZero, formatLabel]);

  // Momentum scrolling animation
  const animateMomentum = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    let velocity = dragState.current.velocity;
    
    // Deceleration factor
    const friction = 0.95;
    const minVelocity = 0.5;

    const animate = () => {
      if (Math.abs(velocity) < minVelocity) {
        // Snap on stop
        const { index, offset } = snapToIndex(scrollOffset);
        onChange(index);
        return;
      }

      velocity *= friction;
      const newOffset = Math.max(
        -halfVisible * itemHeight,
        Math.min(totalHeight - containerHeight + halfVisible * itemHeight, scrollOffset + velocity)
      );
      
      setScrollOffset(newOffset);
      dragState.current.velocity = velocity;
      dragState.current.animationFrame = requestAnimationFrame(animate);
    };

    dragState.current.animationFrame = requestAnimationFrame(animate);
  }, [scrollOffset, halfVisible, itemHeight, totalHeight, containerHeight, snapToIndex, onChange]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (dragState.current.animationFrame) {
        cancelAnimationFrame(dragState.current.animationFrame);
      }
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      
      setIsDragging(true);
      dragState.current = {
        startY: e.clientY,
        startScrollTop: scrollOffset,
        velocity: 0,
        lastY: e.clientY,
        lastTime: Date.now(),
        animationFrame: null,
      };

      if (dragState.current.animationFrame) {
        cancelAnimationFrame(dragState.current.animationFrame);
      }
    },
    [disabled, scrollOffset]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const now = Date.now();
      const deltaY = dragState.current.lastY - e.clientY;
      const deltaTime = Math.max(now - dragState.current.lastTime, 1);

      // Calculate velocity (pixels per frame ~16ms)
      dragState.current.velocity = (deltaY / deltaTime) * 16;
      dragState.current.lastY = e.clientY;
      dragState.current.lastTime = now;

      const newOffset = dragState.current.startScrollTop + (e.clientY - dragState.current.startY);
      setScrollOffset(newOffset);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragState.current.velocity) > 1) {
      animateMomentum();
    } else {
      const { index } = snapToIndex(scrollOffset);
      onChange(index);
    }
  }, [isDragging, scrollOffset, animateMomentum, snapToIndex, onChange]);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      
      const touch = e.touches[0];
      setIsDragging(true);
      dragState.current = {
        startY: touch.clientY,
        startScrollTop: scrollOffset,
        velocity: 0,
        lastY: touch.clientY,
        lastTime: Date.now(),
        animationFrame: null,
      };

      if (dragState.current.animationFrame) {
        cancelAnimationFrame(dragState.current.animationFrame);
      }
    },
    [disabled, scrollOffset]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const now = Date.now();
      const deltaY = dragState.current.lastY - touch.clientY;
      const deltaTime = Math.max(now - dragState.current.lastTime, 1);

      dragState.current.velocity = (deltaY / deltaTime) * 16;
      dragState.current.lastY = touch.clientY;
      dragState.current.lastTime = now;

      const newOffset = dragState.current.startScrollTop + (touch.clientY - dragState.current.startY);
      setScrollOffset(newOffset);
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragState.current.velocity) > 1) {
      animateMomentum();
    } else {
      const { index } = snapToIndex(scrollOffset);
      onChange(index);
    }
  }, [isDragging, scrollOffset, animateMomentum, snapToIndex, onChange]);

  // Wheel handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (disabled) return;
      e.preventDefault();
      
      const newOffset = scrollOffset + e.deltaY * 0.5;
      setScrollOffset(newOffset);

      // Debounced snap after wheel stops
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => {
        const { index } = snapToIndex(newOffset);
        onChange(index);
      }, 150);
    },
    [disabled, scrollOffset, snapToIndex, onChange]
  );

  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  // Keyboard handlers
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      let newIndex = selectedIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(0, selectedIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(items.length - 1, selectedIndex + 1);
          break;
        case 'PageUp':
          e.preventDefault();
          newIndex = Math.max(0, selectedIndex - halfVisible);
          break;
        case 'PageDown':
          e.preventDefault();
          newIndex = Math.min(items.length - 1, selectedIndex + halfVisible);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== selectedIndex) {
        onChange(newIndex);
        setFocusedIndex(newIndex);
      }
    },
    [disabled, selectedIndex, items.length, halfVisible, onChange]
  );

  // Global mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  
  const lastExternalIndex = useRef(selectedIndex);

  useEffect(() => {
    if (!isDragging && lastExternalIndex.current !== selectedIndex) {
      lastExternalIndex.current = selectedIndex;

      const startOffset = scrollOffset;
      const endOffset = targetOffset;
     
      if (Math.abs(startOffset - endOffset) < 1) {
        setScrollOffset(endOffset);
        return;
      }
      const duration = 200; // ms
      const startTime = Date.now();

      const animateToTarget = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentOffset = startOffset + (endOffset - startOffset) * eased;
        
        setScrollOffset(currentOffset);

        if (progress < 1) {
          requestAnimationFrame(animateToTarget);
        }
      };
      requestAnimationFrame(animateToTarget);
    }
  }, [selectedIndex, isDragging]);

  const handleItemClick = useCallback(
    (index: number) => {
      if (disabled) return;
      onChange(index);
    },
    [disabled, onChange]
  );

  return {
    containerRef,
    virtualItems,
    scrollOffset,
    isDragging,
    focusedIndex,
    containerHeight,
    totalHeight,
    handlers: {
      onMouseDown: handleMouseDown,
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onKeyDown: handleKeyDown,
      onItemClick: handleItemClick,
    },
  };
};