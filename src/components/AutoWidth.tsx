import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import useResizeObserver from 'use-resize-observer';

interface AutoWidthProps {
  state: 'unmounted' | 'entering' | 'entered' | 'exiting' | 'exited';
  fadeOnly?: boolean;
  children: React.ReactNode;
}

const AutoWidth: FC<AutoWidthProps> = ({ children, state, fadeOnly }) => {
  const [width, setWidth] = useState(0);
  const [measured, setMeasured] = useState(false);
  const [entered, setEntered] = useState(false);
  const fakeChildrenRef = useRef<HTMLDivElement>(null);
  const measuredWidth = useRef(0);
  const { ref, width: currentWidth = 0 } = useResizeObserver<HTMLDivElement>();

  const measure = () => {
    if (!fakeChildrenRef.current) return;
    measuredWidth.current = fakeChildrenRef.current.offsetWidth;
    setMeasured(true);
  };

  useEffect(() => {
    measure();
  }, [fakeChildrenRef]);

  useEffect(() => {
    if (!entered) return;
    setWidth(currentWidth);
  }, [currentWidth]);

  useEffect(() => {
    switch (state) {
      case 'entering':
        measure();
        setWidth(measuredWidth.current);
        break;
      case 'entered':
        setEntered(true);
        break;
      case 'exiting':
        setEntered(false);
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            setWidth(0);
          });
        }, 0);
        break;
      case 'exited':
        setMeasured(false);
        setEntered(false);
        break;
      default:
        break;
    }
  }, [state]);

  return (
    <>
      {!measured &&
        createPortal(
          <Measurements>
            {React.Children.map(children, (_child) => {
              const child = _child as React.ReactElement<React.PropsWithChildren<any>>;
              return (
                <FakeChild ref={fakeChildrenRef}>
                  {React.cloneElement<any>(child, child.props)};
                </FakeChild>
              );
            })}
          </Measurements>,
          document.body
        )}
      <WidthMutant
        fadeOnly={fadeOnly}
        state={state}
        ref={ref}
        style={{ width: entered ? 'auto' : `${width}px` }}
      >
        {children}
      </WidthMutant>
    </>
  );
};

export default AutoWidth;

const Measurements = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  z-index: -999;
  opacity: 0;
  pointer-events: none;
`;

const WidthMutant = styled.div<{
  fadeOnly?: boolean;
  state: 'unmounted' | 'entering' | 'entered' | 'exiting' | 'exited';
}>`
  transition: width ${({ theme, fadeOnly }) => (fadeOnly ? 0 : theme.transitions.normal)}ms ease-out,
    opacity ${({ theme }) => theme.transitions.normal}ms ease-out;
  opacity: ${({ state }) => (state === 'entered' || state === 'entering' ? 1 : 0)};
`;

const FakeChild = styled.div`
  display: inline-block;
`;
