import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { Transition } from 'react-transition-group'

import Card from './Card'

const Popup = ({ children, referenceElement, active, popupRef, onCloseAreaClick, placement = 'right', offset = 8 }) => {
   const [popperElement, setPopperElement] = useState(null)
   const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement,
      modifiers: [
         {
            name: 'preventOverflow',
            options: {
               altAxis: true,
               padding: 16
            }
         },
         {
            name: 'offset',
            options: {
               offset: [offset, offset]
            }
         }
      ]
   })

   const preventRightClick = (e) => {
      e.preventDefault()
   }

   const popperRef = (el) => {
      setPopperElement(el)
      if (popupRef) popupRef.current = el
   }

   return (
      <>
         {createPortal(
            <Transition in={active} timeout={200} unmountOnExit mountOnEnter appear>
               {() => <CloseArea onClick={onCloseAreaClick} />}
            </Transition>,
            document.body
         )}
         {createPortal(
            <Transition
               onEnter={(node) => node.offsetHeight}
               in={active}
               timeout={200}
               unmountOnExit
               mountOnEnter
               appear
            >
               {(state) => (
                  <Wrapper state={state} ref={popperRef} style={styles.popper} {...attributes.popper}>
                     {children}
                  </Wrapper>
               )}
            </Transition>,
            document.body
         )}
      </>
   )
}

export default Popup

const CloseArea = styled.button`
   position: fixed;
   top: 0;
   right: 0;
   width: 100%;
   height: 100%;
   bottom: 0;
   left: 0;
   background-color: transparent;
   opacity: 0;
   z-index: 9999;
`

const Wrapper = styled(Card)`
   opacity: ${({ state }) => (state === 'entering' || state === 'entered' ? 1 : 0)};
   transition: opacity ${({ state }) => (state === 'entering' || state === 'entered' ? '0.05s' : '0.2s')} ease-out,
      filter 0.2s ease;
   /* pointer-events: ${({ state }) => (state === 'entering' || state === 'entered' ? 'auto' : 'none')}; */
   padding: 0;
   margin: 0;
   min-width: 188px;
   max-width: 320px;
   max-height: calc(100vh - 32px);
   z-index: 99999;
   filter: ${({ state }) => (state === 'entering' || state === 'entered' ? 'blur(0px)' : 'blur(50px)')};
`
