import { useEffect } from 'react';

const useAutoRefresh = (refreshFunction, interval = 10000) => {
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof refreshFunction === 'function') {
        refreshFunction();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [refreshFunction, interval]);
};

export default useAutoRefresh;