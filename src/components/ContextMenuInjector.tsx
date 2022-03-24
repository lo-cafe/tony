import React, { useState, useEffect, useRef, useMemo } from 'react';

import SelectableList from './SelectableList';
import Popup from './Popup';

const ContextMenuInjector = ({ children, options }) => {
  const [active, setActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const onRightClick = (e) => {
    e.preventDefault();
    // const popupEl = popupRef.current.getBoundingClientRect()
    setMousePosition({ x: e.clientX, y: e.clientY });
    setActive(true);
  };
  const handleOnClick = (func: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!func) return;
    func();
  };
  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onClick: handleOnClick(() => setActive(true)),
        className: 'nodrag',
      })}
      <Popup
        placement="bottom-start"
        offset={0}
        active={active}
        onCloseAreaClick={handleOnClick(() => setActive(false))}
        popupRef={popupRef}
        referenceElement={triggerRef.current}
      >
        <SelectableList onOptionSelect={() => setActive(false)} options={options} />
      </Popup>
    </>
  );
};

export default ContextMenuInjector;
