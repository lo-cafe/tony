import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMessageSquare, FiTrash2, FiPlus, FiUser, FiList, FiLink } from 'react-icons/fi';

import { ChatNode, ID, Character } from '~/types/data';

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
          {item.type === 'text' ? <FiMessageSquare /> : <FiList />}
          {item.type}
        </ItemTitle>
        <IdTag>
          <Id>{item.id}</Id>
        </IdTag>
      </ItemTitleBar>
      <ItemBody>{item.message}</ItemBody>
      <ItemBottomBar>
        <Tag onClick={handleOnClick(() => setCharacterOpen((old) => !old))}>
          <FiUser />
          <span>{characters.find((char) => char.id === item.character)?.name || 'No one'}</span>
        </Tag>
        <Tag onClick={handleOnClick(() => setLinkedOpen((old) => !old))}>
          <FiLink />
          <span>{item.goesTo.length}</span>
        </Tag>
      </ItemBottomBar>
      {linkedOpen && (
        <GoingToPanel>
          {item.goesTo.map((goingTo) => (
            <GoingToPanelItem
              onMouseEnter={() => setHoveredDeleteOption(goingTo)}
              onMouseLeave={() => setHoveredDeleteOption(null)}
              key={goingTo}
              onClick={handleOnClick(() => removeLink(item.id, goingTo))}
            >
              <Id>{goingTo}</Id>
              <FiTrash2 />
            </GoingToPanelItem>
          ))}
          <GoingToPanelItem add onClick={handleOnClick(() => setAddLinkMode(item.id))}>
            <span>Add link</span>
            <FiPlus />
          </GoingToPanelItem>
        </GoingToPanel>
      )}
      {characterOpen && (
        <GoingToPanel>
          {characters.map((char) => (
            <GoingToPanelItem
              key={char.id}
              add
              onClick={handleOnClick(() => setCharacter(item.id, char.id))}
            >
              {char.name}
            </GoingToPanelItem>
          ))}
        </GoingToPanel>
      )}
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

const ExternalWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: #fafafa;
  background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.11' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
`;

const Wrapper = styled.div`
  height: 10000px;
  width: 10000px;
  position: relative;
`;

const Item = styled.div<ItemProps>`
  padding: ${({ selected }) => (selected ? '6px' : '10px')};
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
  border: ${({ selected }) => (selected ? '4px solid #00bcd4' : 'none')};
  ${AddItem} {
    left: ${({ selected }) => (selected ? '-19px' : '-15px')};
    bottom: ${({ selected }) => (selected ? '-19px' : '-15px')};
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
