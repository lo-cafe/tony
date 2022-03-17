import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiMessageSquare,
  FiTrash2,
  FiPlus,
  FiUser,
  FiList,
  FiLink,
  FiHelpCircle,
} from 'react-icons/fi';

import ContextMenuInjector from '~/components/ContextMenuInjector';
import { ChatNode, ID, Character } from '~/types/data';
import {
  CHAT_NODE_CONDITION_TYPE,
  CHAT_NODE_ANSWER_TYPE,
  CHAT_NODE_TEXT_TYPE,
} from '~/constants/variables';

interface ItemProps {
  fadedOut?: boolean;
  selected?: boolean;
}

interface ChatNodeCardProps extends React.HTMLProps<HTMLDivElement>, ItemProps {
  isDragging?: boolean;
  item: ChatNode;
  removeLink: (id: ID, goingTo: ID) => void;
  setAddLinkMode: (id: ID) => void;
  addItem: (id: ID) => void;
  setHoveredDeleteOption: (id: ID | null) => void;
  setCharacter: (itemId: ID, charId: ID) => void;
  characters: Character[];
  onCardClick: (id: ID) => void;
}

const ChatNodeCard: FC<ChatNodeCardProps> = ({
  isDragging,
  item,
  removeLink,
  setAddLinkMode,
  addItem,
  setHoveredDeleteOption,
  setCharacter,
  characters,
  fadedOut,
  selected,
  className,
  onCardClick,
}) => {
  const [characterOpen, setCharacterOpen] = useState(false);
  const [linkedOpen, setLinkedOpen] = useState(false);

  const bindDisableLinkedOpen = () => {
    if (linkedOpen) setLinkedOpen(false);
    if (characterOpen) setCharacterOpen(false);
  };

  const handleOnClick = (func: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!func || isDragging) return;
    func();
  };

  useEffect(() => {
    document.addEventListener('click', bindDisableLinkedOpen);
    return () => {
      document.removeEventListener('click', bindDisableLinkedOpen);
    };
  }, [linkedOpen, characterOpen]);

  if (item.type === CHAT_NODE_CONDITION_TYPE) {
    return (
      <Item
        id={item.id}
        className={className}
        selected={selected}
        fadedOut={fadedOut}
        onClick={handleOnClick(() => onCardClick && onCardClick(item.id))}
      >
        <button>Conditions</button>
        <FiHelpCircle />
        <button>Links</button>
      </Item>
    );
  }

  return (
    <Item
      id={item.id}
      fadedOut={fadedOut}
      onClick={handleOnClick(() => onCardClick && onCardClick(item.id))}
      selected={selected}
      className={className}
    >
      <AddItem onClick={handleOnClick(() => addItem(item.id))}>
        <FiPlus />
      </AddItem>
      <ItemTitleBar>
        <ItemTitle>
          {item.type === CHAT_NODE_TEXT_TYPE ? <FiMessageSquare /> : <FiList />}
          {item.type}
        </ItemTitle>
        <IdTag>
          <Id>{item.id}</Id>
        </IdTag>
      </ItemTitleBar>
      <ItemBody>{item.message}</ItemBody>
      <ItemBottomBar>
        <ContextMenuInjector
          isDragging={isDragging}
          options={characters.map((char) => ({
            label: char.name,
            icon: <FiUser />,
            type: 'item',
            onClick: () => setCharacter(item.id, char.id),
          }))}
        >
          <Tag>
            <FiUser />
            <span>{characters.find((char) => char.id === item.character)?.name || 'No one'}</span>
          </Tag>
        </ContextMenuInjector>
        <ContextMenuInjector
          isDragging={isDragging}
          options={[
            ...item.goesTo.map((goingTo) => ({
              label: <Id>{goingTo}</Id>,
              icon: <FiTrash2 />,
              type: 'item',
              color: 'red',
              onClick: () => removeLink(item.id, goingTo),
              onMouseEnter: () => setHoveredDeleteOption(goingTo),
              onMouseLeave: () => setHoveredDeleteOption(null),
            })),
            { type: 'divider' },
            {
              color: '#0050d3',
              type: 'item',
              label: 'Add link',
              icon: <FiPlus />,
              onClick: () => setAddLinkMode(item.id),
            },
          ]}
        >
          <Tag>
            <FiLink />
            <span>{item.goesTo.length}</span>
          </Tag>
        </ContextMenuInjector>
      </ItemBottomBar>
    </Item>
  );
};

export default ChatNodeCard;

const Id = styled.span`
  font-size: 12px;
  font-family: 'Roboto Mono', monospace;
  text-transform: none;
`;

const AddItem = styled.button`
  color: white;
  background: #0068f6;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -15px;
  left: -15px;
  z-index: 2;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  &:hover {
    background: #0050d3;
  }
`;

const Item = styled.div<ItemProps & { condition?: boolean }>`
  padding: 10px;
  display: inline-block;
  background: white;
  border-radius: 16px;
  position: absolute;
  left: 0;
  top: 0;
  width: 250px;
  height: 150px;
  display: flex;
  margin: 0;
  gap: 8px;
  cursor: pointer;
  flex-direction: column;
  z-index: 2;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 300ms ease-out, opacity 300ms ease-out;
  opacity: ${({ fadedOut }) => (fadedOut ? 0.35 : 1)};
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    border: ${({ selected }) => (selected ? '4px solid #00bcd4' : '0px solid #00bcd4')};
    transition: border 150ms ease-out;
    pointer-events: none;
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

const ItemBody = styled.div`
  background: #f3f3f3;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  flex: 1;
  width: 100%;
  text-align: left;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  transition: background-color 300ms ease-out;
  &:hover {
    background-color: #005ee2;
  }
`;

const GoingToPanel = styled.div`
  padding: 10px;
  display: inline-block;
  background: white;
  border-radius: 16px;
  position: absolute;
  width: 125px;
  display: flex;
  top: 155px;
  right: 0;
  margin: 0;
  flex-direction: column;
  gap: 4px;
  z-index: 3;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
`;

const GoingToPanelItem = styled.div<{ add?: boolean }>`
  background: #f3f3f3;
  padding: 6px 12px;
  border-radius: 8px;
  display: flex;
  font-weight: 600;
  justify-content: space-between;
  font-size: 14px;
  align-items: center;
  transition: background-color 300ms ease-out;
  color: ${({ add }) => (add ? '#0068f6' : 'red')};
  &:hover {
    background-color: #e6e6e6;
  }
`;
