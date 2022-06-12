import {
  MutableRefObject,
  createContext,
  useState,
  useRef,
  HTMLAttributes,
  useContext,
} from 'react';
import { nanoid } from 'nanoid';
import styled, { css } from 'styled-components';

const TheEye = createContext<{
  addToGreatInsight: (id: string, els: HTMLElement[]) => void;
} | null>(null);

interface TheTransitionerProps {
  children: React.ReactNode;
}

interface InSight {
  [key: string]: {
    el: HTMLElement;
    pos: {
      x?: number;
      y?: number;
    };
  }[];
}

const TheTransitioner: FC<TheTransitionerProps> = ({ children }) => {
  const inSight = useRef<InSight>({});
  const isEyeWatching = useRef(false);


  const loop = () => {
    if (!isEyeWatching.current) return;
    Object.keys(inSight.current).forEach((id) => {
      const els = inSight.current[id];
      if (!els.length) return;
      els.forEach((elSet, i) => {
        const { x, y } = elSet.el.getBoundingClientRect();
        if (elSet.pos.x === undefined || elSet.pos.y === undefined) elSet.pos = { x, y };
        if (x !== elSet.pos.x || y !== elSet.pos.y) {
        }
      });
    });
    setTimeout(() => {
      loop();
    }, 8);
  };

  const updateLoop = () => {
    const oldState = isEyeWatching.current;
    isEyeWatching.current = !!Object.keys(inSight.current).length;
    if (!oldState) loop();
  };

  const addToGreatInsight = (id: string, els: HTMLElement[]) => {
    inSight.current[id] = els.map((el) => ({ el, pos: {} }));
    updateLoop();
  };

  return <TheEye.Provider value={{ addToGreatInsight }}>{children}</TheEye.Provider>;
};

const useInSightOfTheEye = <T,>() => {
  const addToGreatInsight = useContext(TheEye)?.addToGreatInsight;
  if (!addToGreatInsight) return;
  const [isTheLidClosed, setIsTheLidClosed] = useState(false);
  const watcher = useRef<HTMLElement[]>([]);
  const id = useRef<string>(nanoid());

  const inSight = (el_: T) => {
    const el = el_ as unknown as HTMLElement;
    const existentOneI = watcher.current.findIndex((e) => e.isEqualNode(el));
    if (existentOneI > -1) {
      watcher.current[existentOneI] = el;
    } else {
      watcher.current.push(el);
    }
    updateGreatInSight();
  };

  const updateGreatInSight = () => {
    addToGreatInsight(id.current, watcher.current);
    watcher.current = [];
  };

  inSight.ref = watcher;
  inSight.setLid = setIsTheLidClosed;

  return inSight;
};

export default TheTransitioner;
