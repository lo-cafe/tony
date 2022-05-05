import { useState, useEffect, memo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FiMessageSquare, FiUser, FiList } from 'react-icons/fi';
import { Handle, Position, Node, Connection } from 'react-flow-renderer';
import { darken, lighten, rgba, getLuminance } from 'polished';

import useUserStore from '~/instances/userStore';
import LaceString from '~/components/LaceString';
import ContextMenuInjector from '~/components/ContextMenuInjector';
import { ChatNodeData, ID, Character } from '~/types/data';
import { CHAT_NODE_ANSWER_TYPE } from '~/constants/variables';
import colors from '~/constants/colors';

interface ChatNodeCardProps extends ChatNodeData {
  fadeOut?: boolean;
  setCharacter?: (itemId: ID, charId: ID) => void;
  characters?: Character[];
  isConnectionValid?: (
    source: ID,
    target: ID,
    sourceHandle: string | null,
    targetHandle: string | null
  ) => boolean;
}

const ChatNodeCard: FC<Node<ChatNodeCardProps> & { testId?: string }> = memo(
  ({ type, id, data, selected, className, connectable, testId }) => {
    const { showNodeIds } = useUserStore((s) => s.preferences);
    const isValidConnection = (connection: Connection) => {
      if (!data.isConnectionValid || !connection.source || !connection.target) return true;
      return data.isConnectionValid(
        connection.source,
        connection.target,
        connection.sourceHandle,
        connection.targetHandle
      );
    };
    return (
      <Item
        // fadedOut={fadedOut}
        cardType={type as 'answer' | 'text'}
        selected={selected}
        className={className}
        data-testid={testId}
      >
        <TargetHandle
          isValidConnection={isValidConnection}
          type="target"
          id="target"
          isConnectable={connectable}
          position={Position.Top}
        />
        <ItemTitleBar>
          <ItemTitle data-testid="node-type">
            {type === CHAT_NODE_ANSWER_TYPE ? <FiList /> : <FiMessageSquare />}
            {type === CHAT_NODE_ANSWER_TYPE ? 'Answer' : 'Text'}
          </ItemTitle>
          {showNodeIds && (
            <IdTag>
              <Id>{id}</Id>
            </IdTag>
          )}
        </ItemTitleBar>
        <ItemWrapper>
          <ItemBody>{data.message}</ItemBody>
        </ItemWrapper>
        <ItemBottomBar>
          <ContextMenuInjector
            options={data.characters?.map((char) => ({
              label: char.name,
              icon: <FiUser />,
              type: 'item',
              onClick: () => data.setCharacter && data.setCharacter(id, char.id),
            }))}
          >
            <Tag>
              <FiUser />
              <span>
                {data.characters?.find((char) => char.id === data.character)?.name || 'No one'}
              </span>
            </Tag>
          </ContextMenuInjector>
        </ItemBottomBar>
        <SourceHandle
          type="source"
          isConnectable={connectable}
          isValidConnection={isValidConnection}
          position={Position.Bottom}
          id="a"
        />
      </Item>
    );
  }
);

export default ChatNodeCard;

const LACE_SIZE = 25;

const Tag = styled.div`
  background-color: #0068f6;
  padding: 3px 6px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  transition: background-color ${({ theme }) => theme.transitions.normal}ms ease-out;
  &:hover {
    background-color: #005ee2;
  }
`;

const TargetHandle = styled(Handle)`
  background: ${({ theme }) => theme.colors.cardBg};
  border: none;
  border-radius: 50%;
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
    height: ${LACE_SIZE}px;
    width: ${LACE_SIZE}px;
    background-size: cover;
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
  bottom: -5px;
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

interface ItemProps {
  fadedOut?: boolean;
  selected?: boolean;
}

const Id = styled.span`
  font-size: 12px;
  font-family: 'Roboto Mono', monospace;
  text-transform: none;
`;

const ItemTitleBar = styled.div`
  background: #0068f6;
  padding: 6px 12px;
  border-radius: 8px;
  text-transform: capitalize;
  color: white;
  display: flex;
  justify-content: space-between;
  padding-right: 8px;
  align-items: center;
  width: 100%;
`;

const IdTag = styled.div`
  background: white;
  padding: 1px 6px;
  color: #0068f6;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  line-height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;

const putInPlace = (color: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${color}, 0px 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  70% {
    box-shadow: 0 0 0 10px rgba(0, 104, 246, 0), 0px 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  100% {
    box-shadow: 0 0 0 0 rgba(0, 104, 246, 0), 0px 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Item = styled.div<ItemProps & { cardType: 'answer' | 'text' }>`
  padding: 10px;
  padding-top: 20px;
  display: inline-block;
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: 16px;
  width: 249px;
  height: 175px;
  display: flex;
  margin: 0;
  gap: 8px;
  cursor: pointer;
  flex-direction: column;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow ${({ theme }) => theme.transitions.normal}ms ease-out,
    opacity ${({ theme }) => theme.transitions.normal}ms ease-out;
  opacity: ${({ fadedOut }) => (fadedOut ? 0.35 : 1)};
  animation: ${({ cardType, theme }) =>
      cardType === 'answer'
        ? putInPlace(rgba(theme.nodeColors.answerNode, 0.5))
        : putInPlace(rgba(theme.nodeColors.textNode, 0.5))}
    1s ease-out;
  ${ItemTitleBar}, ${Tag}, ${SourceHandle} {
    transition: transform ${({ theme }) => theme.transitions.normal}ms ease-out,
      background ${({ theme }) => theme.transitions.normal}ms ease-out;
    color: ${({ cardType, theme }) =>
      getLuminance(
        cardType === 'answer' ? theme.nodeColors.answerNode : theme.nodeColors.textNode
      ) > 0.4
        ? colors.light.font
        : colors.dark.font};
    background: ${({ cardType, theme }) =>
      cardType === 'answer' ? theme.nodeColors.answerNode : theme.nodeColors.textNode};
  }
  ${Tag}, ${SourceHandle} {
    &:hover {
      background-color: ${({ cardType, theme }) =>
        cardType === 'answer'
          ? darken(0.2, theme.nodeColors.answerNode)
          : darken(0.2, theme.nodeColors.textNode)};
    }
  }
  & ${IdTag} {
    color: ${({ cardType, theme }) =>
      cardType === 'answer' ? theme.nodeColors.answerNode : theme.nodeColors.textNode};
  }
  & ${TargetHandle}::after {
    background-image: ${({ theme, cardType }) =>
      `url(
        ${LaceString(
          cardType === 'answer' ? theme.nodeColors.answerNode : theme.nodeColors.textNode
        )}
      )`};
  }
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
    border: ${({ selected, cardType, theme }) =>
      selected
        ? `4px solid ${
            cardType === 'answer'
              ? lighten(0.2, theme.nodeColors.answerNode)
              : lighten(0.2, theme.nodeColors.textNode)
          };`
        : `0px solid ${
            cardType === 'answer'
              ? lighten(0.2, theme.nodeColors.answerNode)
              : lighten(0.2, theme.nodeColors.textNode)
          }`};
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

const ItemWrapper = styled.div`
  background: ${({ theme }) => theme.colors.inputBg};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  flex: 1;
  width: 100%;
  text-align: left;
`;

const ItemBody = styled.pre`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  font-family: inherit;
  margin: 0;
  white-space: break-spaces;
  height: 54.5px;
  color: ${({ theme }) => theme.colors.font};
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  width: 100%;
`;

const ItemBottomBar = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 4px;
`;
