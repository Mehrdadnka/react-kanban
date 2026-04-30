// features/activity-heatmap/engine/tooltip-position.ts
interface TooltipPosition {
  x: number;
  y: number;
  arrowDirection: 'up' | 'down';
}

export function calculateTooltipPosition(
  clientX: number,
  clientY: number,
  tooltipWidth: number = 150,
  tooltipHeight: number = 50,
  offset: number = 12
): TooltipPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let x = clientX;
  let y = clientY - tooltipHeight - offset;
  let arrowDirection: 'up' | 'down' = 'up';
  
  if (y < 10) {
    y = clientY + offset;
    arrowDirection = 'down';
  }
  
  if (y + tooltipHeight > viewportHeight - 10) {
    y = clientY - tooltipHeight - offset;
    arrowDirection = 'up';
  }
  
  x = x - tooltipWidth / 2;
  
  if (x + tooltipWidth > viewportWidth - 10) {
    x = viewportWidth - tooltipWidth - 10;
  }
  
  if (x < 10) {
    x = 10;
  }
  
  return { x, y, arrowDirection };
}