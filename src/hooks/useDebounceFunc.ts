import { useRef } from 'react';

const useDebounceFunc = <T>(func: (...args: any[]) => T, wait: number) => {
  const timeout = useRef<number | undefined>(undefined);

  const debouncedFunc = (...args: any[]) => {
    const thereWasATimeout = !!timeout.current;
    clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      if (thereWasATimeout) func(...args);
      timeout.current = undefined;
    }, wait);
    if (!thereWasATimeout) return func(...args);
  };

  return debouncedFunc;
};

export default useDebounceFunc;
