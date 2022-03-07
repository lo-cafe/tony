import { useEffect, useState, useRef, createRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { nanoid } from 'nanoid';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import cloneDeep from 'lodash/cloneDeep';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable'; // Both at the same time
import {
  FiLink,
  FiMessageSquare,
  FiList,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiBox,
  FiCheck,
  FiUser,
  FiDownload,
} from 'react-icons/fi';
import AutowidthInput from 'react-autowidth-input';

import {
  ID,
  ChatNode,
  Character,
  Chat,
  Workspace,
  DataStructure,
  ChatNodeType,
} from '~/types/data';

import FixedButton from '~/components/FixedButton';
import ChatNodeCard from '~/components/ChatNodeCard';
import downloadFile from '~/utils/downloadFile';
import { Optional } from '~/types/utils';

const IDS_SIZE = 8;

const initialCharacterData = (): Character => ({
  id: nanoid(8),
  name: 'Char 1',
  description: '',
});

const initialChatNodeData = (): ChatNode => ({
  id: nanoid(8),
  message: 'Enter text...',
  type: 'text',
  goesTo: [],
  character: initialCharacterData().id,
  x: 444,
  y: 202,
});

const initialChatData = (): Chat => ({
  id: nanoid(IDS_SIZE),
  name: 'New Chat',
  nodes: [initialChatNodeData()],
});

const initialWorkspaceData = (): Workspace => ({
  name: 'New Workspace',
  id: nanoid(IDS_SIZE),
  characters: [initialCharacterData()],
  chats: [initialChatData()],
});

const initialData: DataStructure = [initialWorkspaceData()];

const loadOrSave = (data?: DataStructure): DataStructure => {
  if (typeof window === 'undefined') return initialData;
  if (data) {
    localStorage.setItem('data', JSON.stringify(data));
    return data;
  }
  const storedData = localStorage.getItem('data');
  return !storedData || !JSON.parse(storedData).length ? initialData : JSON.parse(storedData);
};

interface MousePosition {
  x: number;
  y: number;
}

const Story = () => {
  const updateXarrow = useXarrow();
  const [data, setData] = useState<DataStructure>(loadOrSave());

  const [grabbingMode, setGrabbingMode] = useState(false);
  const [isGrabbing, _setIsGrabbing] = useState<MousePosition | null>(null);

  const [editPillModeId, setEditPillModeId] = useState<ID | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<ID | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<ID | null>(null);
  const [selectedChatNodeId, setSelectedChatNodeId] = useState<ID | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [addLinkMode, setAddLinkMode] = useState<ID | false>(false);
  const [hoveredDeleteOption, setHoveredDeleteOption] = useState<ID | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isGrabbingRef = useRef<MousePosition | null>(null);

  const setIsGrabbing = (data: MousePosition | null) => {
    isGrabbingRef.current = data;
    _setIsGrabbing(data);
  };

  const getSelectedWorkspace = (obj: DataStructure): Workspace | null =>
    obj.find((w) => w.id === selectedWorkspaceId) || null;

  const getSelectedChat = (obj: DataStructure): Chat | null =>
    getSelectedWorkspace(obj)?.chats.find((c) => c.id === selectedChatId) || null;

  const getSelectedChatNode = (obj: DataStructure): ChatNode | null =>
    getSelectedChat(obj)?.nodes.find((cn) => cn.id === selectedChatNodeId) || null;

  const selectedWorkspace = getSelectedWorkspace(data);
  const selectedChat = getSelectedChat(data);
  const selectedChatNode = getSelectedChatNode(data);

  const removeLink = (originChatNodeId: ID, link: ID) => {
    if (!selectedChat) return;
    const dataCopy = cloneDeep(data);
    const target = getSelectedChat(dataCopy)?.nodes.find((node) => node.id === originChatNodeId);
    if (!target) return;
    target.goesTo = target.goesTo.filter((i) => i !== link);
    setData(dataCopy);
    setHoveredDeleteOption(null);
  };

  const addLink = (to: ID) => {
    if (to === addLinkMode) return setAddLinkMode(false);
    if (!selectedChat) return;
    const dataCopy = cloneDeep(data);
    getSelectedChat(dataCopy)
      ?.nodes.find(({ id }) => id === addLinkMode)
      ?.goesTo.push(to);
    setData(dataCopy);
    setAddLinkMode(false);
  };

  const addItem = (originChatNodeId: ID, type: ChatNodeType = 'text') => {
    const dataCopy = cloneDeep(data);
    const selectedChatCopy = getSelectedChat(dataCopy);
    const originNode = selectedChatCopy?.nodes.find((item) => item.id === originChatNodeId);
    if (!originNode) return;

    const newItem: ChatNode = {
      ...initialChatNodeData(),
      character: originNode.character,
      x: originNode.x,
      y: originNode.y + 180,
    };

    selectedChatCopy?.nodes.push(newItem);
    originNode.goesTo.push(newItem.id);

    setData(dataCopy);
  };

  const moveItem = (id: ID, x: number, y: number) => {
    const dataCopy = cloneDeep(data);
    const originNode = getSelectedChat(dataCopy)?.nodes.find((item) => item.id === id);
    if (!originNode) return;
    originNode.x = x;
    originNode.y = y;
    setData(dataCopy);
  };

  const deleteChatNode = (id: ID) => {
    if (selectedChat?.nodes.length === 1) {
      return alert('You cannot delete the last node of a chat.');
    }
    if (!window.confirm('Are you sure you want to delete this item?') || !selectedChat) return;
    const dataCopy = cloneDeep(data);
    const selectedChatCopy = getSelectedChat(dataCopy);
    if (!selectedChatCopy) return;
    selectedChatCopy.nodes = selectedChatCopy.nodes
      .map((item) => ({ ...item, goesTo: item.goesTo.filter((i) => i !== id) }))
      .filter((item) => item.id !== id);
    setData(dataCopy);
  };

  const onDrag = () => {
    setIsDragging(true);
    updateXarrow();
  };

  const onDragEnd = (id: ID, _e: DraggableEvent, info: DraggableData) => {
    moveItem(id, info.x, info.y);
    updateXarrow();
    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  };

  const handleCardClick = (id: ID) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addLinkMode) {
      addLink(id);
    } else if (!isDragging) {
      setSelectedChatNodeId(id === selectedChatNodeId ? null : id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    if (!selectedChatNode) return;
    const dataCopy = cloneDeep(data);
    const selectedChatNodeCopy = getSelectedChatNode(dataCopy);
    selectedChatNodeCopy!.message = value;
    setData(dataCopy);
  };

  const changeType = (id: ID, type: ChatNodeType) => {
    if (!selectedChatNode) return;
    const dataCopy = cloneDeep(data);
    const selectedChatNodeCopy = getSelectedChat(dataCopy)?.nodes.find((node) => node.id === id);
    selectedChatNodeCopy!.type = type;
    setData(dataCopy);
  };

  const unselect = () => {
    setAddLinkMode(false);
    setSelectedChatNodeId(null);
  };

  const deleteChat = (targetId: ID) => {
    if (!targetId || !window.confirm('Are you sure you want to delete this item?')) return;
    if (!selectedWorkspace) return;
    const dataCopy = cloneDeep(data);
    const selectedWorkspaceCopy = getSelectedWorkspace(dataCopy);
    selectedWorkspaceCopy!.chats = selectedWorkspaceCopy!.chats.filter(({ id }) => id !== targetId);
    setData(dataCopy);
  };

  const deleteWorkspace = (targetId: ID) => {
    if (!targetId || !window.confirm('Are you sure you want to delete this item?')) return;
    const dataCopy = cloneDeep(data);
    setData(dataCopy.filter(({ id }) => id !== targetId));
  };

  const deleteChar = (targetId: ID) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    if (!selectedWorkspace) return;
    const dataCopy = cloneDeep(data);
    const selectedWorkspaceCopy = getSelectedWorkspace(dataCopy);
    selectedWorkspaceCopy!.characters = selectedWorkspaceCopy!.characters.filter(
      (char) => char.id !== targetId
    );
    selectedWorkspaceCopy!.chats = selectedWorkspaceCopy!.chats.map((chat) => ({
      ...chat,
      nodes: chat.nodes.map((node) =>
        node.character !== targetId ? node : { ...node, character: null }
      ),
    }));
    setData(dataCopy);
  };

  const addChar = () => {
    if (!selectedWorkspace) return;
    const dataCopy = cloneDeep(data);
    getSelectedWorkspace(dataCopy)!.characters.push(initialCharacterData());
    setData(dataCopy);
  };

  const addChat = () => {
    if (!selectedWorkspace) return;
    const dataCopy = cloneDeep(data);
    getSelectedWorkspace(dataCopy)!.chats.push(initialChatData());
    setData(dataCopy);
  };

  const addWorkspace = () => {
    const dataCopy = cloneDeep(data);
    setData([...dataCopy, initialWorkspaceData()]);
  };

  const changeWorkspaceName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataCopy = cloneDeep(data);
    console.log(e);
    dataCopy.find((w) => w.id === e.target.name)!.name = e.target.value;
    setData(dataCopy);
  };

  const changeChatName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataCopy = cloneDeep(data);
    getSelectedWorkspace(dataCopy)!.chats.find((chat) => chat.id === e.target.name)!.name =
      e.target.value;
    setData(dataCopy);
  };

  const changeCharName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataCopy = cloneDeep(data);
    getSelectedWorkspace(dataCopy)!.characters.find((char) => char.id === e.target.name)!.name =
      e.target.value;
    setData(dataCopy);
  };

  const setCharacter = (targetId: ID, characterId: ID) => {
    const dataCopy = cloneDeep(data);
    const target = getSelectedChat(dataCopy)!.nodes.find((node) => node.id === targetId)!;
    target.character = target.character === characterId ? null : characterId;
    setData(dataCopy);
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isGrabbingRef.current) document.removeEventListener('mousemove', onMouseMove);
      if (!scrollRef.current) return;
      const { scrollTop, scrollLeft } = scrollRef.current;
      const newX = scrollLeft - e.movementX;
      const newY = scrollTop - e.movementY;
      scrollRef.current.scrollTo(newX, newY);
    },
    [scrollRef.current]
  );

  const onSpaceDown = (e: KeyboardEvent) => {
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      e.code !== 'Space'
    )
      return;
    e.preventDefault();
    setGrabbingMode(true);
  };

  const onSpaceUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    setGrabbingMode(false);
  };

  const startGrabbing = useCallback(({ screenX, screenY }: React.MouseEvent<HTMLDivElement>) => {
    setIsGrabbing({ x: screenX, y: screenY });
    document.addEventListener('mousemove', onMouseMove);
  }, []);

  const stopGrabbing = () => {
    document.removeEventListener('mousemove', onMouseMove);
    setIsGrabbing(null);
  };

  useEffect(() => {
    document.addEventListener('keydown', onSpaceDown);
    document.addEventListener('keyup', onSpaceUp);
    return () => {
      document.removeEventListener('keydown', onSpaceDown);
      document.removeEventListener('keyup', onSpaceUp);
    };
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.addEventListener('scroll', updateXarrow);
    return () => {
      if (!scrollRef.current) return;
      scrollRef.current.removeEventListener('scroll', updateXarrow);
    };
  }, [scrollRef]);

  useEffect(() => {
    loadOrSave(data);
  }, [data]);

  const exportToJson = (id: ID) => {
    const dataCopy = cloneDeep(data);
    const target = dataCopy.find((x) => x.id === id);
    if (!target) return;
    // target.chats = target.chats.map((chat) => ({
    //   ...chat,
    //   nodes: chat.nodes.map(({ id, message, type, goesTo, character }) => ({
    //     id,
    //     message,
    //     type,
    //     goesTo,
    //     character,
    //   })),
    // }));
    downloadFile({
      data: JSON.stringify(target),
      fileName: `${target.name}-Chats.json`,
      fileType: 'text/json',
    });
  };

  return (
    <>
      {grabbingMode && (
        <Grabber grabbing={!!isGrabbing} onMouseDown={startGrabbing} onMouseUp={stopGrabbing} />
      )}
      <WorkspacesWrapper>
        {data.map((w) => (
          <FixedButton
            key={w.id}
            icon={<FiBox />}
            data={w.id}
            value={w.name}
            selected={w.id === selectedWorkspaceId}
            onClick={setSelectedWorkspaceId}
            onValueChange={changeWorkspaceName}
            onDownload={exportToJson}
            onDelete={deleteWorkspace}
          />
        ))}
        <FixedButton icon={<FiPlus />} onClick={addWorkspace} add value="New workspace" />
      </WorkspacesWrapper>
      {selectedWorkspace && (
        <ChatsWrapper>
          {selectedWorkspace.chats.map((chat) => (
            <FixedButton
              key={chat.id}
              icon={<FiMessageSquare />}
              data={chat.id}
              value={chat.name}
              selected={chat.id === selectedChatId}
              onClick={setSelectedChatId}
              onValueChange={changeChatName}
              onDelete={deleteChat}
            />
          ))}
          <FixedButton icon={<FiPlus />} onClick={addChat} add value="New chat" />
        </ChatsWrapper>
      )}
      {selectedWorkspace && (
        <CharactersWrapper>
          {selectedWorkspace.characters.map((char) => (
            <FixedButton
              key={char.id}
              icon={<FiUser />}
              data={char.id}
              value={char.name}
              onValueChange={changeCharName}
              onDelete={deleteChar}
            />
          ))}
          <FixedButton icon={<FiPlus />} onClick={addChar} add value="New character" />
        </CharactersWrapper>
      )}
      {selectedChatNode && (
        <SidePanel>
          <SidePanelContent>
            <ItemTitleBar>
              <ItemTitle>
                {selectedChatNode.type === 'text' ? <FiMessageSquare /> : <FiList />}
                {selectedChatNode.type}
              </ItemTitle>
              <IdTag>{selectedChatNode.id}</IdTag>
            </ItemTitleBar>
            <TypeChooserWrapper>
              <TypeChooser
                onClick={() => changeType(selectedChatNodeId!, 'text')}
                selected={selectedChatNode.type === 'text'}
              >
                <FiMessageSquare />
                <span>Text</span>
              </TypeChooser>
              <TypeChooser
                onClick={() => changeType(selectedChatNodeId!, 'answer')}
                selected={selectedChatNode.type === 'answer'}
              >
                <FiList />
                <span>Answer</span>
              </TypeChooser>
            </TypeChooserWrapper>
            <Textarea
              onChange={handleInputChange}
              name="message"
              value={selectedChatNode.message}
            />
          </SidePanelContent>
          <DeleteButton onClick={() => deleteChatNode(selectedChatNodeId!)}>Delete</DeleteButton>
        </SidePanel>
      )}
      <ExternalWrapper onClick={unselect} ref={scrollRef}>
        <Wrapper>
          {selectedWorkspace && selectedChat && selectedChat && (
            <Xwrapper>
              {selectedChat.nodes.map((item, i) => (
                <Draggable
                  defaultPosition={{ x: item.x, y: item.y }}
                  position={{ x: item.x, y: item.y }}
                  scale={1}
                  key={item.id}
                  onDrag={onDrag}
                  onStop={(...rest) => onDragEnd(item.id, ...rest)}
                >
                  <div>
                    <ChatNodeCard
                      characters={selectedWorkspace.characters}
                      setCharacter={setCharacter}
                      setHoveredDeleteOption={setHoveredDeleteOption}
                      addItem={addItem}
                      isDragging={isDragging}
                      selected={selectedChatNodeId === item.id}
                      fadedOut={
                        (addLinkMode && addLinkMode !== item.id) ||
                        (!!hoveredDeleteOption && hoveredDeleteOption !== item.id)
                      }
                      onClick={handleCardClick(item.id)}
                      removeLink={removeLink}
                      setAddLinkMode={setAddLinkMode}
                      item={item}
                    />
                  </div>
                </Draggable>
              ))}
              {selectedChat.nodes.map((item, i) =>
                item.goesTo.map((goingTo) => (
                  <Xarrow zIndex={1} key={nanoid()} start={item.id} end={goingTo} />
                ))
              )}
            </Xwrapper>
          )}
        </Wrapper>
      </ExternalWrapper>
    </>
  );
};

export default Story;

const Grabber = styled.div<{ grabbing?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  cursor: ${({ grabbing }) => (grabbing ? 'grabbing' : 'grab')};
`;

const PillInput = styled(AutowidthInput)`
  border: none;
  color: inherit;
  min-width: unset;
  background: lightyellow;
  border-radius: 4px;
  padding: 4px 8px;
  width: min-content;
  font-weight: inherit;
  font-size: inherit;
`;

const WorkspacesWrapper = styled.div`
  display: flex;
  position: fixed;
  top: 25px;
  left: 25px;
  z-index: 3;
  gap: 8px;
  color: #424242;
`;

const ChatsWrapper = styled(WorkspacesWrapper)`
  top: unset;
  bottom: 25px;
`;

const CharactersWrapper = styled(WorkspacesWrapper)`
  top: 75px;
`;

const DeleteButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  background: red;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  align-self: flex-end;
  &:hover {
    background: #ff5252;
  }
`;

const TypeChooserWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const TypeChooser = styled.button<{ selected: boolean }>`
  flex: 1;
  display: flex;
  border: none;
  flex-direction: column;
  align-items: center;
  margin: 5px;
  font-size: 16px;
  background: #f3f3f3;
  border-radius: 5px;
  padding: 8px;
  gap: 4px;
  cursor: pointer;
  font-sizs: 14px;
  font-weight: 600;
  color: ${({ selected }) => (selected ? '#0068f6' : 'gray')};
  &:hover {
    background: #e3e3e3;
  }
`;

const SidePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const SidePanel = styled.div`
  position: fixed;
  height: calc(100vh - 50px);
  width: 400px;
  top: 25px;
  right: 25px;
  background: rgba(255, 255, 255, 0.7);
  padding: 25px;
  border-radius: 24px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(40px);
`;

const Textarea = styled.textarea`
  width: 100%;
  border: none;
  border-radius: 8px;
  background: #f3f3f3;
  padding: 10px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
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
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
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

const CardStyle = css``;

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
