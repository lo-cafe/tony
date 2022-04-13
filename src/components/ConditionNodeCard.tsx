import { useState, useEffect, memo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiHelpCircle } from 'react-icons/fi';
import { Handle, Position, Node, Connection } from 'react-flow-renderer';
import { darken, lighten, getLuminance } from 'polished';

import { light, dark } from '~/constants/colors';
import LaceString from '~/components/LaceString';
import { ID } from '~/types/data';

interface ConditionNodeCardProps {
  fadeOut?: boolean;
  isConnectionValid?: (source: ID, target: ID, sourceHandle: string | null) => boolean;
}

const ConditionNodeCard: FC<{ className: string } & Node<ConditionNodeCardProps>> = memo(
  ({ id, data, selected, className }) => {
    const isValidConnection = (connection: Connection) => {
      if (!data.isConnectionValid || !connection.source || !connection.target) return true;
      return data.isConnectionValid(connection.source, connection.target, connection.sourceHandle);
    };
    return (
      <Item
        // fadedOut={fadedOut}
        // onClick={handleOnClick(() => onCardClick && onCardClick(item.id))}
        selected={selected}
        className={className}
      >
        <TargetHandle type="target" position={Position.Top} />
        <ItemTitleBar>
          <ItemTitle data-testid="node-type">
            <ConditionHandle
              isValidConnection={isValidConnection}
              type="source"
              position={Position.Left}
              id="condition"
            />
            <FiHelpCircle />
            Condition
          </ItemTitle>
          <IdTag>
            <Id>{id}</Id>
          </IdTag>
        </ItemTitleBar>
        <ResultsWrapper>
          <div>
            YES
            <SourceHandle
              type="source"
              isValidConnection={isValidConnection}
              position={Position.Bottom}
              id="yes"
            />
          </div>
          <div>
            NO
            <SourceHandle
              isValidConnection={isValidConnection}
              type="source"
              position={Position.Bottom}
              style={{ background: 'red' }}
              id="no"
            />
          </div>
        </ResultsWrapper>
      </Item>
    );
  }
);

export default ConditionNodeCard;

const LACE_SIZE = 25;

const ResultsWrapper = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
  & > div {
    background: ${({ theme }) =>
      getLuminance(theme.colors.bg) > 0.4
        ? darken(0.2, theme.colors.bg)
        : lighten(0.2, theme.colors.bg)};
    /* background: ${({ theme }) => theme.colors.conditionResultWrapperBg}; */
    border-radius: 8px;
    padding-bottom: 5px;
    margin-bottom: 8px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${({ theme }) => (getLuminance(theme.colors.bg) > 0.4 ? light.font : dark.font)};
    font-family: 'Roboto Mono', monospace;
    flex: 1;
  }
`;

const bounce = keyframes`
  0% {
    transform: translate(-50%) scale(1)
  }
  50% {
    transform: translate(-50%) scale(1.5);
  }
`;

const bounce2 = keyframes`
  0% {
    transform: translateY(-50%) scale(1)
  }
  50% {
    transform: translateY(-50%) scale(1.5);
  }
`;

const TargetHandle = styled(Handle)`
  background: ${({ theme }) => theme.colors.cardBg};
  border: none;
  border-radius: 50%;
  border:
  font-size: 16px;
  height: ${LACE_SIZE / 2}px;
  width: ${LACE_SIZE}px;
  overflow: visible;
  z-index: 3;
  top: 5px;
  &::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    overflow: visible;
    background-image: url(${({ theme }) => LaceString(theme.nodeColors.conditionNode)});
    height: ${LACE_SIZE}px;
    width: ${LACE_SIZE}px;
    background-size: cover;
  }
`;

const SourceHandle = styled(Handle)<{ target?: boolean; type: string }>`
  color: white;
  background: #0068f6;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  height: 15px;
  width: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9;
  /* transform: scale(2); */
  bottom: -11px;
  cursor: pointer;
  border: 4px solid ${({ theme }) => theme.colors.cardBg};
  transition: ${({ theme }) => theme.transitions.normal}ms transform ease-out;
  &.connecting {
    animation: ${bounce} 1600ms infinite linear;
  }
  &:hover {
    transform: translate(-50%) scale(1.2);
  }
`;

const ConditionHandle = styled(SourceHandle)`
  background: ${({ theme }) => getLuminance(theme.colors.cardBg) > 0.4 ? '#424242' : '#f5f5f5'};
  border-color: ${({ theme }) => theme.colors.cardBg};
  left: -27px;
  &:hover {
    transform: translateY(-50%) scale(1.2);
  }
  &.connecting {
    animation: ${bounce2} 1600ms infinite linear;
  }
`;

// const ConditionHandle = styled(Handle)`
//   left: -29px;
//   width: 0;
//   height: 0;
//   z-index: 1;
//   border-style: solid;
//   border-width: 7px 12px 7px 0;
//   border-color: transparent #424242 transparent transparent;
//   border-radius: 0;
//   background: transparent;
//   transition: ${({ theme }) => theme.transitions.normal}ms transform ease-out;
//   &.connecting {
//     animation: ${bounce2} 1600ms infinite linear;
//   }
//   &:hover {
//     transform: translateY(-50%) scale(1.2);
//   }
// `;

interface ItemProps {
  fadedOut?: boolean;
  selected?: boolean;
}

const Id = styled.span`
  font-size: 12px;
  font-family: 'Roboto Mono', monospace;
  text-transform: none;
`;

const putInPlace = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(66, 66, 66, 0.5), 0px 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  70% {
    box-shadow: 0 0 0 10px rgba(0, 104, 246, 0), 0px 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  100% {
    box-shadow: 0 0 0 0 rgba(0, 104, 246, 0), 0px 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Item = styled.div<ItemProps & { condition?: boolean }>`
  padding: 20px 10px 0;
  display: inline-block;
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: 16px;
  width: 220px;
  height: 130px;
  display: flex;
  margin: 0;
  gap: 8px;
  cursor: pointer;
  flex-direction: column;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow ${({ theme }) => theme.transitions.normal}ms ease-out, opacity ${({ theme }) => theme.transitions.normal}ms ease-out;
  opacity: ${({ fadedOut }) => (fadedOut ? 0.35 : 1)};
  animation: ${putInPlace} 1s ease-out;
  user-select: none;
  -webkit-user-drag: none;
  & * {
    user-select: none;
    -webkit-user-drag: none;
  }
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    border: ${({ selected, theme }) =>
      selected
        ? `4px solid ${lighten(0.2, theme.nodeColors.conditionNode)}`
        : `0px solid ${lighten(0.2, theme.nodeColors.conditionNode)}`};
    transition: border ${({ theme }) => theme.transitions.superQuick}ms ease-out;
    pointer-events: none;
  }
  &::before {
    position: absolute;
    content: '';
    height: 4px;
    background: ${({ theme }) => theme.colors.cardBg};
    width: 25px;
    top: 0;
    left: 0;
    right: 0;
    margin: auto;
    z-index: 1;
  }
  &:hover {
    box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.15);
    opacity: 1;
  }
  &:active {
    cursor: grabbing;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const ItemTitleBar = styled.div`
  background: ${({ theme }) => theme.nodeColors.conditionNode};
  padding: 6px 12px;
  border-radius: 8px;
  text-transform: capitalize;
  color: ${({ theme }) =>
    getLuminance(theme.nodeColors.conditionNode) > 0.4 ? light.font : dark.font};
  display: flex;
  justify-content: space-between;
  padding-right: 8px;
  align-items: center;
  width: 100%;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  width: 100%;
  position: relative;
`;

const ItemBottomBar = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 4px;
`;

const IdTag = styled.div`
  background: white;
  padding: 1px 6px;
  color: #424242;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  line-height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;
