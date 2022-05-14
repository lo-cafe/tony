import { useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';

const useTimeTravel: <T = void>(
  initialState: T,
  callback?: () => void
) => {
  present: React.MutableRefObject<T>;
  setState: (newState: T, callCallback?: boolean) => void;
  undo: () => void;
  redo: () => void;
  past: React.MutableRefObject<T[]>;
  future: React.MutableRefObject<T[]>;
} = (initialState, callback) => {
  const past = useRef<typeof initialState[]>([]);
  const present = useRef(initialState);
  const future = useRef<typeof initialState[]>([]);

  const undo = () => {
    console.log(past)
    if (!past.current.length) return;
    const copyFuture = cloneDeep(future.current);
    copyFuture.unshift(present.current);
    future.current = copyFuture;
    present.current = past.current[0];
    const copyPast = cloneDeep(past.current);
    copyPast.shift();
    past.current = copyPast;
    if (callback && typeof callback === 'function') callback();
  };

  const redo = () => {
    if (!future.current.length) return;
    const copyPast = cloneDeep(past.current);
    copyPast.unshift(present.current);
    past.current = copyPast;
    present.current = future.current[0];
    const copyFuture = cloneDeep(future.current);
    copyFuture.shift();
    future.current = copyFuture;
    if (callback && typeof callback === 'function') callback();
  };

  const setState = (state: typeof initialState, callCallback?: boolean) => {
    const copyPast = cloneDeep(past.current);
    copyPast.unshift(present.current);
    past.current = copyPast;
    present.current = state;
    future.current = [];
    if (callCallback && callback && typeof callback === 'function') callback();
  };

  return { present, setState, undo, redo, past, future };
};

export default useTimeTravel;
