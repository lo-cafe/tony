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
      console.log(connection, 'hy');
      console.log(data.isConnectionValid, 'hu');
      if (!data.isConnectionValid || !connection.source || !connection.target) return true;
      console.log('hy');
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
    background-image: url('data:image/svg+xml;utf8,<svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2851 21.2911C15.97 21.907 15.5225 22.5587 14.9424 23.2462C14.3623 23.9337 13.7034 24.589 12.9658 25.212C12.2282 25.8351 11.4691 26.3615 10.6885 26.7911C9.90788 27.2208 9.16667 27.4858 8.46485 27.5861C7.87761 27.6863 7.42285 27.9047 7.10059 28.2413C6.77832 28.5779 6.61719 29.0255 6.61719 29.5841C6.61719 30.0997 6.81055 30.5616 7.19727 30.9698C7.58398 31.378 8.11393 31.5249 8.78711 31.4103C9.58919 31.2814 10.4629 30.977 11.4082 30.4972C12.3535 30.0174 13.2809 29.4015 14.1904 28.6495C15.0999 27.8976 15.6396 27.5929 17 26C18.3604 24.4071 19.6419 22.5599 20 21.5C20.3438 22.5599 21.4 24.5 22.7 26C24 27.5 24.5817 27.8976 25.4912 28.6495C26.4007 29.4015 27.3245 30.0174 28.2627 30.4972C29.2008 30.977 30.0781 31.2814 30.8945 31.4103C31.582 31.5249 32.1191 31.378 32.5059 30.9698C32.8926 30.5616 33.0859 30.0997 33.0859 29.5841C33.0859 29.0255 32.9212 28.5779 32.5918 28.2413C32.2624 27.9047 31.7969 27.6863 31.1953 27.5861C30.4935 27.4858 29.7559 27.2208 28.9824 26.7911C28.209 26.3615 27.4535 25.8351 26.7158 25.212C25.9782 24.589 25.3193 23.9337 24.7393 23.2462C24.1592 22.5587 23.7116 21.907 23.3965 21.2911C27 20.5 29.9786 18.8157 31 17.5C31.6346 16.6827 31.9759 15.8699 32.334 15.1251C32.6921 14.3803 32.8711 13.5782 32.8711 12.7189C32.8711 11.172 32.3626 9.8901 31.3457 8.87317C30.3288 7.85624 29.0469 7.34778 27.5 7.34778C26.6549 7.34778 25.8385 7.51607 25.0508 7.85266C24.263 8.18925 23.5505 8.66549 22.9131 9.28137C22.2757 9.89726 21.7279 10.6349 21.2695 11.4943L19.85 14L18.4121 11.4943C17.9538 10.6349 17.4023 9.89726 16.7578 9.28137C16.1133 8.66549 15.4043 8.18925 14.6309 7.85266C13.8574 7.51607 13.0339 7.34778 12.1602 7.34778C10.6133 7.34778 9.33139 7.85624 8.31446 8.87317C7.29753 9.8901 6.78907 11.172 6.78907 12.7189C6.78907 13.5782 6.9681 14.3803 7.32618 15.1251C7.68425 15.8699 8.17839 16.5431 8.8086 17.1446C10.2291 18.5268 12.5 20.5 16.2851 21.2911ZM14.6201 17.9181C15.501 18.2332 16.4427 18.3907 17.4453 18.3907L18.0254 18.3908V17.8322C18.0254 16.8725 17.875 15.9594 17.5742 15.0929C17.2735 14.2264 16.8653 13.4601 16.3496 12.7941C15.834 12.1281 15.2432 11.6053 14.5772 11.2257C13.9112 10.8462 13.1986 10.6564 12.4395 10.6564C11.7233 10.6564 11.1504 10.8712 10.7207 11.3009C10.291 11.7306 10.0762 12.325 10.0762 13.0841C10.0762 13.7143 10.2731 14.3445 10.667 14.9747C11.0609 15.6049 11.598 16.1743 12.2783 16.6827C12.9587 17.1912 13.7393 17.603 14.6201 17.9181ZM21.6348 18.3907H22.2149C23.2175 18.3907 24.1628 18.2332 25.0508 17.9181C25.9388 17.603 26.723 17.1912 27.4033 16.6827C28.0837 16.1743 28.6172 15.6049 29.0039 14.9747C29.3907 14.3445 29.584 13.7143 29.584 13.0841C29.584 12.325 29.3727 11.7306 28.9502 11.3009C28.5277 10.8712 27.9512 10.6564 27.2207 10.6564C26.4759 10.6564 25.7705 10.8461 25.1045 11.2257C24.4385 11.6053 23.8441 12.128 23.3213 12.7941C22.7985 13.4601 22.3868 14.2264 22.086 15.0929C21.7852 15.9594 21.6348 16.8725 21.6348 17.8321V18.3907Z" fill="${({
      cardType,
      theme,
    }) =>
      cardType === 'answer'
        ? theme.nodeColors.answerNode.replace('#', '%23')
        : theme.nodeColors.textNode.replace('#', '%23')}"/></svg>');
    background-image: url(${({ theme, cardType }) =>
      LaceString(cardType === 'answer' ? theme.nodeColors.answerNode : theme.nodeColors.textNode)});
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
