
import { useEffect, useState } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const [renderTime, setRenderTime] = useState(0);
  const [startTime] = useState(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    setRenderTime(duration);
    
    if (duration > 100) {
      console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
    }
  }, [componentName, startTime]);

  return { renderTime };
};

export default usePerformanceMonitor;
