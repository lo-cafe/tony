import { useRef, useEffect } from 'react';

const useDebouncedCallback = <T>(func: (...args: any[]) => T, dependencies: any[], wait: number) => {
  const currentFunc = useRef<(...args: any[]) => T>(func);
  const timeout = useRef<number | undefined>(undefined);

  const updateDebounce = () => {
    const thereWasATimeout = !!timeout.current;
    clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      if (thereWasATimeout) currentFunc.current = func;
      timeout.current = undefined;
    }, wait);
    if (!thereWasATimeout) return currentFunc.current = func;
  };

  useEffect(() => {
    updateDebounce();
  }, dependencies);

  return currentFunc.current;
};

export default useDebouncedCallback;
