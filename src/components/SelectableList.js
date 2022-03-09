import React from 'react'
import styled from 'styled-components'

const SelectableList = ({ options, onOptionSelect, ...rest }) => {
   const onClickProxy = (cb) => {
      if (onOptionSelect) onOptionSelect()
      if (cb) cb()
   }

   const rightOptionKind = (option) => {
      if (option === 'divider') return <hr />
      if (typeof option === 'string') return <span>{option}</span>
      if (typeof option === 'function') return option()
      if (typeof option === 'object') {
         return (
            <button onClick={() => onClickProxy(option.onClick)} type="button">
               {typeof option.label === 'function' ? option.label() : <span>{option.label}</span>}
            </button>
         )
      }
   }

   return (
      <Ul {...rest}>
         {options.map((option, index) => (
            <li key={index}>{rightOptionKind(option)}</li>
         ))}
      </Ul>
   )
}

export default SelectableList

const Ul = styled.ul`
   margin: 0;
   padding: 6px 8px;
   li {
      list-style: none;
      & > span {
         display: block;
         text-transform: uppercase;
         font-size: 12px;
         font-weight: 500;
         margin: 2px 6px;
         font-family: 'upgrade';
         opacity: 0.5;
      }
      hr {
         border: none;
         height: 1px;
         background-color: ${({ theme }) => theme.DIVIDER_SOFT};
         margin: 6px;
      }
      button {
         background-color: transparent;
         border: none;
         display: block;
         width: 100%;
         padding: 0;
         & > * {
            display: block;
            width: 100%;
            text-align: left;
            background-color: transparent;
            border: none;
            padding: 8px 12px;
            color: ${({ theme }) => theme.TITLE};
            border-radius: 3px;
            cursor: pointer;
            transition: 150ms ease-out;
            margin: 1px 0;
            &:hover {
               background-color: ${({ theme }) => theme.TITLE};
               color: ${({ theme }) => theme.BG};
            }
         }
      }
   }
`
