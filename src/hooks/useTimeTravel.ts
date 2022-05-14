import { useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';

const useTimeTravel: <T = void>(
  initialState: T
) => {
  present: React.MutableRefObject<T>;
  past: React.MutableRefObject<T[]>;
  future: React.MutableRefObject<T[]>;
  snapshot: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
} = (initialState) => {
  const past = useRef<typeof initialState[]>([]);
  const present = useRef(initialState);
  const future = useRef<typeof initialState[]>([]);

  const undo = () => {
    if (!past.current.length) return;
    const copyFuture = cloneDeep(future.current);
    const copyPresent = cloneDeep(present.current);
    copyFuture.unshift(copyPresent);
    future.current = copyFuture;
    present.current = past.current[0];
    const copyPast = cloneDeep(past.current);
    copyPast.shift();
    past.current = copyPast;
  };

  const redo = () => {
    if (!future.current.length) return;
    const copyPast = cloneDeep(past.current);
    const copyPresent = cloneDeep(present.current);
    copyPast.unshift(copyPresent);
    past.current = copyPast;
    present.current = future.current[0];
    const copyFuture = cloneDeep(future.current);
    copyFuture.shift();
    future.current = copyFuture;
  };

  const snapshot = () => {
    const copyPast = cloneDeep(past.current);
    const copyPresent = cloneDeep(present.current);
    copyPast.unshift(copyPresent);
    if (copyPast.length > 100) copyPast.pop();
    past.current = copyPast;
    future.current = [];
  };

  const reset = () => {
    past.current = [];
    future.current = [];
  };

  return { present, past, future, undo, redo, snapshot, reset };
};

export default useTimeTravel;
