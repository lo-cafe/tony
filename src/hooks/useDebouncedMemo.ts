import { useRef, useEffect } from 'react';

const useDebouncedMemo = <T>(func: () => T, dependencies: any[], wait: number) => {
  const currentValue = useRef<T>(func());
  const timeout = useRef<number | undefined>(undefined);

  const updateValue = (...args: any[]) => {
    const thereWasATimeout = !!timeout.current;
    clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      if (thereWasATimeout) currentValue.current = func();
      timeout.current = undefined;
    }, wait);
    if (!thereWasATimeout) return currentValue.current = func();
  };

  useEffect(() => {
    updateValue();
  }, dependencies);

  return currentValue.current;
};

export default useDebouncedMemo;
