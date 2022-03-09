import React, { useState, useEffect, useRef, useMemo } from 'react'

import SelectableList from './SelectableList'
import Popup from './Popup'

const ContextMenuInjector = ({ children, options }) => {
   const [active, setActive] = useState(false)
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
   const triggerRef = useRef(null)
   const popupRef = useRef(null)
   const virtualElement = useMemo(
      () => ({
         getBoundingClientRect: () => ({
            top: mousePosition.y,
            left: mousePosition.x,
            bottom: mousePosition.y,
            right: mousePosition.x,
            width: 0,
            height: 0
         })
      }),
      [mousePosition]
   )

   const onRightClick = (e) => {
      e.preventDefault()
      // const popupEl = popupRef.current.getBoundingClientRect()
      setMousePosition({ x: e.clientX, y: e.clientY })
      setActive(true)
   }

   useEffect(() => {
      if (!triggerRef.current) return
      triggerRef.current.addEventListener('contextmenu', onRightClick)
      return () => {
         triggerRef.current.removeEventListener('contextmenu', onRightClick)
      }
   }, [triggerRef])
   return (
      <>
         {children({ ref: triggerRef })}
         <Popup
            placement="bottom-start"
            offset={0}
            active={active}
            onCloseAreaClick={() => setActive(false)}
            popupRef={popupRef}
            referenceElement={virtualElement}
         >
            <SelectableList onOptionSelect={() => setActive(false)} options={options} />
         </Popup>
      </>
   )
}

export default ContextMenuInjector
