import React, { useState, useRef } from 'react';

import SelectableList from './SelectableList';
import Popup from './Popup';

interface ContextMenuInjectorProps {
  options?: any;
  popupElement?: React.ReactElement;
  children?: React.ReactNode
}

const ContextMenuInjector: FC<ContextMenuInjectorProps> = ({ children, options, popupElement }) => {
  const [active, setActive] = useState(false);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const handleOnClick = (func: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!func) return;
    func();
  };
  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
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
        {popupElement ||
          (!!options && (
            <SelectableList onOptionSelect={() => setActive(false)} options={options} />
          ))}
      </Popup>
    </>
  );
};

export default ContextMenuInjector;
