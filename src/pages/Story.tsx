import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { nanoid } from 'nanoid';
import cloneDeep from 'lodash/cloneDeep';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import {
  FiMessageSquare,
  FiList,
  FiPlus,
  FiBox,
  FiUser,
  FiHelpCircle,
  FiPlay,
  FiTrash2,
} from 'react-icons/fi';
import ReactFlow, {
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  useKeyPress,
  MiniMap,
  updateEdge,
  Background,
  useViewport,
  ReactFlowInstance,
  useUpdateNodeInternals,
} from 'react-flow-renderer';

import {
  ID,
  ChatNode,
  Character,
  Chat,
  Workspace,
  DataStructure,
  ChatNodeTypes,
} from '~/types/data';

import CustomEdge from '~/components/CustomEdge';
import FixedButton from '~/components/FixedButton';
import ChatNodeCard from '~/components/ChatNodeCard';
import ConditionNodeCard from '~/components/ConditionNodeCard';
import {
  CHAT_NODE_CONDITION_TYPE,
  CHAT_NODE_ANSWER_TYPE,
  CHAT_NODE_TEXT_TYPE,
  ID_SIZE,
  COLORS,
} from '~/constants/variables';
import downloadFile from '~/utils/downloadFile';
import {
  initialCharacterData,
  initialChatNodeData,
  initialChatData,
  initialWorkspaceData,
  initialData,
} from '~/constants/initialData';

interface MousePosition {
  x: number;
  y: number;
}

const nodeTypes = { text: ChatNodeCard, condition: ConditionNodeCard, answer: ChatNodeCard };
const edgeTypes = { button: CustomEdge };

const loadOrSave = (data?: DataStructure): DataStructure => {
  if (typeof window === 'undefined') return initialData;
  if (data) {
    localStorage.setItem('data', JSON.stringify(data));
    return data;
  }
  const storedData = localStorage.getItem('data');
  return !storedData || !JSON.parse(storedData).length ? initialData : JSON.parse(storedData);
};

const loadedData = loadOrSave();

const Story = () => {
  const altPressed = useKeyPress('AltLeft');
  const updateNodeInternals = useUpdateNodeInternals();
  const data = useRef<DataStructure>(loadedData);
  const [workspacesNames, _setWorkspacesNames] = useState<Partial<Workspace>[]>(
    data.current.map(({ id, name }) => ({ id, name }))
  );
  const [characters, setCharacters] = useState<Character[]>(data.current[0]?.characters);
  const [chatsNames, _setChatsNames] = useState<Partial<Chat>[]>(
    data.current[0]?.chats.map(({ id, name }) => ({ id, name }))
  );
  const [nodes, setNodes] = useState<ChatNode[]>(data.current[0]?.chats[0]?.nodes);
  const [edges, setEdges] = useState<Edge[]>(data.current[0]?.chats[0]?.edges);
  const { zoom } = useViewport();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<ID | null>(loadedData[0].id);
  const [selectedChatId, setSelectedChatId] = useState<ID | null>(loadedData[0].chats[0].id);
  const [isAddingNewNode, setIsAddingNewNode] = useState<boolean | 'ending'>(false);

  const [whatToPlay, setWhatToPlay] = useState<{ toShow: ChatNode; buttons: ChatNode[] } | null>(
    null
  );

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef(null);
  const lastCopied = useRef<null | Node>(null);
  const playModeAnswersIds = useRef<ID[]>([]);

  const setChatsNames = (newChats: (old: Partial<Chat>[]) => Partial<Chat>[]) =>
    _setChatsNames((old) => newChats(old).map(({ id, name }) => ({ id, name })));

  const setWorkspacesNames = (newWorkspaces: (old: Partial<Workspace>[]) => Partial<Workspace>[]) =>
    _setWorkspacesNames((old) => newWorkspaces(old).map(({ id, name }) => ({ id, name })));

  const getSelectedWorkspace = (obj: DataStructure): Workspace | null =>
    obj.find((w) => w.id === selectedWorkspaceId) || null;

  const getSelectedChat = (obj: DataStructure): Chat | null =>
    getSelectedWorkspace(obj)?.chats.find((c) => c.id === selectedChatId) || null;

  const getRelatedEdges = (nodeId: ID, edges: Edge[]) =>
    edges.filter((e) => e.source === nodeId || e.target === nodeId);

  const selectedWorkspace = getSelectedWorkspace(data.current);
  const selectedChat = getSelectedChat(data.current);
  const selectedNodes = useMemo(() => nodes.filter((x) => x.selected), [nodes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setNodes(
      nodes.map((item) =>
        item.selected
          ? {
              ...item,
              data: {
                ...item.data,
                message: value,
              },
            }
          : item
      )
    );
  };

  const changeType = (id: ID, type: ChatNodeTypes) => {
    setNodes(
      nodes.map((item) =>
        item.id === id
          ? {
              ...item,
              type,
            }
          : item
      )
    );
    if (type === CHAT_NODE_CONDITION_TYPE)
      setEdges(edges.filter((edg) => edg.source !== id && edg.target !== id));
    updateNodeInternals(id);
  };

  // console.log(nodes)

  const deleteChat = (targetId: ID) => {
    if (
      !selectedWorkspace ||
      !targetId ||
      !window.confirm('Are you sure you want to delete this item?')
    )
      return;
    if (targetId === selectedChatId) setSelectedChatId(null);
    _setChatsNames((old) => old.filter(({ id }) => id !== targetId));
  };

  const deleteWorkspace = (targetId: ID) => {
    if (!targetId || !window.confirm('Are you sure you want to delete this item?')) return;
    if (targetId === selectedWorkspaceId) {
      setSelectedChatId(null);
      setSelectedWorkspaceId(null);
    }
    _setWorkspacesNames((old) => old.filter(({ id }) => id !== targetId));
  };

  const deleteChar = (targetId: ID) => {
    if (!selectedWorkspace || !window.confirm('Are you sure you want to delete this item?')) return;
    setCharacters((old) => old.filter((char) => char.id !== targetId));
    setNodes((old) =>
      old.map((node) => ({
        ...node,
        data: {
          ...node.data,
          character: node.data.character === targetId ? null : node.data.character,
        },
      }))
    );
  };

  const addChar = () => {
    setCharacters((old) => [...old, initialCharacterData()]);
  };

  const addChat = () => {
    if (!selectedWorkspace) return;
    setChatsNames((old) => [...old, initialChatData()]);
  };

  const addWorkspace = () => {
    setWorkspacesNames((old) => [...old, initialWorkspaceData()]);
  };

  const changeWorkspaceName = (e: React.ChangeEvent<HTMLInputElement>) => {
    _setWorkspacesNames((old) =>
      old.map((w) => (w.id === e.target.name ? { ...w, name: e.target.value } : w))
    );
  };

  const changeChatName = (e: React.ChangeEvent<HTMLInputElement>) => {
    _setChatsNames((old) =>
      old.map((c) => (c.id === e.target.name ? { ...c, name: e.target.value } : c))
    );
  };

  const changeCharName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacters((old) =>
      old.map(({ id, name }) =>
        id === e.target.name ? { id, name: e.target.value } : { id, name }
      )
    );
  };

  const setCharacter = (targetId: ID, characterId: ID) => {
    const previousCharacter = nodes.find((node) => node.id === targetId)?.data.character;
    setNodes((old) =>
      old.map((node) => {
        if (node.id === targetId) {
          return {
            ...node,
            data: {
              ...node.data,
              character: previousCharacter === characterId ? null : characterId,
            },
          };
        }
        return node;
      })
    );
  };

  useEffect(() => {
    if (!selectedChatId) return;
    getSelectedChat(data.current)!.nodes = nodes;
    loadOrSave(data.current);
  }, [nodes]);

  useEffect(() => {
    if (!selectedChatId) return;
    getSelectedChat(data.current)!.edges = edges;
    loadOrSave(data.current);
  }, [edges]);

  useEffect(() => {
    if (!selectedChatId) return;
    getSelectedWorkspace(data.current)!.characters = characters;
    loadOrSave(data.current);
  }, [characters]);

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const selectedWorkspaceChats = getSelectedWorkspace(data.current)!.chats;
    getSelectedWorkspace(data.current)!.chats = chatsNames.map((c) =>
      selectedWorkspaceChats.find(({ id }) => id === c.id)
        ? { ...selectedWorkspaceChats.find(({ id }) => id === c.id), ...c }
        : { ...initialChatData(), ...c }
    ) as Chat[];
    loadOrSave(data.current);
  }, [chatsNames]);

  useEffect(() => {
    data.current = workspacesNames.map((w) =>
      data.current.find(({ id }) => id === w.id)
        ? {
            ...data.current.find(({ id }) => id === w.id),
            ...w,
          }
        : { ...initialWorkspaceData(), ...w }
    ) as DataStructure;
    loadOrSave(data.current);
  }, [workspacesNames]);

  useEffect(() => {
    setChatsNames(() => getSelectedWorkspace(data.current)?.chats || []);
    setNodes(selectedChatId ? getSelectedChat(data.current)!.nodes : []);
    setEdges(selectedChatId ? getSelectedChat(data.current)!.edges : []);
  }, [selectedChatId, selectedWorkspaceId]);

  const transformData = () => {
    const dataCopy = cloneDeep(data.current);
    return dataCopy.map((ws) => ({
      ...ws,
      chats: ws.chats.map((ch) => ({
        id: ch.id,
        name: ch.name,
        nodes: ch.nodes.map((nd) => ({
          id: nd.id,
          type: nd.type,
          message: nd.data.message,
          character: nd.data.character,
          conditions: nd.data.conditions,
          goesTo:
            nd.type === CHAT_NODE_CONDITION_TYPE
              ? ch.edges
                  .filter((e) => e.source === nd.id)
                  .reduce(
                    (prev: { conditions: string[]; yes: string[]; no: string[] }, curr) => {
                      const newConditions = curr.sourceHandle === 'condition' ? [curr.target] : [];
                      const newYes = curr.sourceHandle === 'yes' ? [curr.target] : [];
                      const newNo = curr.sourceHandle === 'no' ? [curr.target] : [];
                      return {
                        conditions: [...prev.conditions, ...newConditions],
                        yes: [...prev.yes, ...newYes],
                        no: [...prev.no, ...newNo],
                      };
                    },
                    { conditions: [], yes: [], no: [] }
                  )
              : ch.edges.filter((e) => e.source === nd.id).map((e) => e.target),
        })),
      })),
    }));
  };

  const exportToJson = (id: ID) => {
    const dataCopy = transformData();
    const target = dataCopy.find((x) => x.id === id);
    if (!target) return;
    downloadFile({
      data: JSON.stringify(target),
      fileName: `${target.name}-Chats.json`,
      fileType: 'text/json',
    });
  };

  // const play = (id: ID) => {
  //   const dataCopy = getSelectedChat(cloneDeep(data));
  //   const target = dataCopy?.nodes.find((x) => x.id === id);
  //   if (!target || target.type !== CHAT_NODE_TEXT_TYPE) return;
  //   setPlayNode(id);
  // };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, type: 'button', animated: true }, eds)),
    [setEdges]
  );
  const removeEdge = useCallback(
    (edgeId) => setEdges((eds) => eds.filter((e) => e.id !== edgeId)),
    [setEdges]
  );
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [setEdges]
  );
  const onNodeDragStart = useCallback(
    (e: React.MouseEvent, rawNode: ChatNode) => {
      if (!altPressed) return true;
      const node = nodes.find((nd) => nd.id === rawNode.id)!;
      lastCopied.current = node;
      const newNodeId = nanoid(ID_SIZE);
      setNodes((nds) => [
        ...nds.map((nd) => ({ ...nd, selected: false })),
        {
          ...node,
          selected: true,
          id: newNodeId,
          data: {
            ...node.data,
            isCopy: true,
          },
        },
      ]);
      const relatedEdges = getRelatedEdges(node.id, edges).map((e) => ({
        ...e,
        id: nanoid(ID_SIZE),
        source: e.source === node.id ? newNodeId : e.source,
        target: e.target === node.id ? newNodeId : e.target,
      }));
      setEdges((eds) => [...eds, ...relatedEdges]);
      return true;
    },
    [altPressed, setNodes]
  );

  const onNodeDrag = useCallback(
    (e: React.MouseEvent, node: ChatNode) => {
      if (!altPressed || !lastCopied.current) return;
      setNodes((nds) =>
        nds.map((nd) =>
          nd.id === lastCopied.current!.id
            ? {
                ...nd,
                data: {
                  ...nd.data,
                  isCopy: false,
                },
                position: { x: lastCopied.current!.position.x, y: lastCopied.current!.position.y },
              }
            : nd
        )
      );
      return true;
    },
    [altPressed, setNodes]
  );
  const onNodeDragStop = useCallback(
    (e: React.MouseEvent, node: ChatNode) => {
      lastCopied.current = null;
      if (!altPressed) return true;
      setNodes((nds) =>
        nds.map((nd) =>
          nd.selected
            ? { ...nd, data: { ...nd.data, isCopy: false } }
            : { ...nd, selected: false, draggable: true }
        )
      );
      return true;
    },
    [altPressed, setNodes]
  );

  useEffect(() => {
    if (!altPressed) {
      setNodes((nds) => nds.filter((nd) => !nd.data.isCopy));
    }
  }, [altPressed]);

  const onStartDragToAddNewNode = () => {
    setTimeout(() => {
      setIsAddingNewNode(true);
    }, 150);
  };

  const onEndDragToAddNewNode = (_e: DraggableEvent, info: DraggableData) => {
    if (!reactFlowInstance) return;
    setIsAddingNewNode('ending');
    setTimeout(() => {
      setIsAddingNewNode(false);
    }, 1);
    const newNode = initialChatNodeData();
    newNode.position = reactFlowInstance.project({ x: info.x - 140, y: info.y + 340 });
    setNodes((nds) => [...nds, newNode]);
  };

  const setWorkspace = (id: ID) => {
    setSelectedWorkspaceId(id);
    const firstChat = data.current.find((x) => x.id === id)?.chats[0];
    setSelectedChatId(firstChat ? firstChat.id : null);
  };

  const playFrom = (firstNode?: ChatNode): void => {
    if (!firstNode) {
      playModeAnswersIds.current = [];
      return setWhatToPlay(null);
    }
    const getLinkedNodes = (node: ChatNode, handler: 'yes' | 'no' | 'condition' | 'a' = 'a') => {
      const relatedEdges = getRelatedEdges(node.id, edges);
      const nextNodes = nodes.filter((x) =>
        relatedEdges
          .filter((x) => x.source === node.id && x.sourceHandle === handler)
          .map((e) => e.target)
          .includes(x.id)
      );
      return nextNodes;
    };
    const whatToShow = (rawNodes: ChatNode[]) =>
      rawNodes
        .map((nd) => {
          switch (nd.type) {
            case CHAT_NODE_CONDITION_TYPE:
              const conditionNodeIds = getLinkedNodes(nd, 'condition').map((x) => x.id);
              return conditionNodeIds.every((id) => playModeAnswersIds.current?.includes(id))
                ? getLinkedNodes(nd, 'yes')
                : getLinkedNodes(nd, 'no');
            default:
              return nd;
          }
        })
        .flat();

    switch (firstNode.type) {
      case CHAT_NODE_CONDITION_TYPE: {
        return playFrom(whatToShow(getLinkedNodes(firstNode, 'no'))[0]);
      }
      case CHAT_NODE_ANSWER_TYPE: {
        playModeAnswersIds.current = [...playModeAnswersIds.current, firstNode.id];
        return playFrom(whatToShow(getLinkedNodes(firstNode))[0]);
      }
      case CHAT_NODE_TEXT_TYPE: {
        setWhatToPlay({
          toShow: firstNode,
          buttons: whatToShow(getLinkedNodes(firstNode, 'a')),
        });
        break;
      }
      default: {
        break;
      }
    }
  };

  const play = () => {
    if (selectedNodes.length !== 1) return;
    playFrom(selectedNodes[0]);
  };

  return (
    <>
      {!!whatToPlay && (
        <PlayModeWrapper>
          <div>
            <CharacterPlayModeName>
              {characters &&
                (characters.find((char) => char.id === whatToPlay.toShow.data.character)?.name ||
                  'No one')}{' '}
              said:
            </CharacterPlayModeName>
            <p>{whatToPlay.toShow.data.message}</p>
            {whatToPlay.buttons.length > 0 ? (
              whatToPlay.buttons.map((btn) => (
                <Button key={btn.id} onClick={() => playFrom(btn)}>
                  {btn.type === CHAT_NODE_TEXT_TYPE ? 'Next' : btn.data.message}
                </Button>
              ))
            ) : (
              <Button onClick={() => playFrom()}>Finish</Button>
            )}
          </div>
        </PlayModeWrapper>
      )}
      <OverlayWrapper>
        <OTopLeft>
          <>
            {workspacesNames.map((w) => (
              <FixedButton
                key={w.id}
                icon={<FiBox />}
                data={w.id}
                value={w.name!}
                selected={w.id === selectedWorkspaceId}
                onClick={setWorkspace}
                onValueChange={changeWorkspaceName}
                onDownload={exportToJson}
                onDelete={deleteWorkspace}
              />
            ))}
            <FixedButton
              icon={<FiPlus />}
              onClick={addWorkspace}
              color="add"
              value="New workspace"
            />
          </>
        </OTopLeft>
        <OTopLeftUnder>
          {selectedWorkspace && (
            <>
              {characters.map((char) => (
                <FixedButton
                  key={char.id}
                  icon={<FiUser />}
                  data={char.id}
                  value={char.name}
                  onValueChange={changeCharName}
                  onDelete={deleteChar}
                />
              ))}
              <FixedButton icon={<FiPlus />} onClick={addChar} color="add" value="New character" />
            </>
          )}
        </OTopLeftUnder>
        <OTopRight>
          <FixedButton
            disabled={selectedNodes.length !== 1}
            icon={<FiPlay />}
            onClick={play}
            color="add"
            value="Play"
          />
          <FixedButton
            onClick={() => {
              if (!window.confirm('Are you really sure?')) return;
              localStorage.removeItem('data');
              data.current = loadOrSave();
            }}
            color="delete"
            icon={<FiTrash2 />}
            value="Erase all data"
          />
          <FixedButton
            onClick={() => {
              reactFlowInstance!.zoomTo(1);
            }}
            color="add"
            value={`${(zoom * 100).toFixed(0)}%`}
          />
        </OTopRight>
        <OTopRightUnder>
          {selectedNodes.length === 1 && (
            <SidePanel color={COLORS[selectedNodes[0].type as ChatNodeTypes]}>
              <SidePanelContent>
                <ItemTitleBar>
                  <ItemTitle>
                    {selectedNodes[0].type === CHAT_NODE_TEXT_TYPE ? (
                      <FiMessageSquare />
                    ) : (
                      <FiList />
                    )}
                    {selectedNodes[0].type}
                  </ItemTitle>
                  <IdTag>{selectedNodes[0].id}</IdTag>
                </ItemTitleBar>
                <TypeChooserWrapper>
                  <TypeChooser
                    onClick={() => changeType(selectedNodes[0].id, CHAT_NODE_TEXT_TYPE)}
                    selected={selectedNodes[0].type === CHAT_NODE_TEXT_TYPE}
                  >
                    <FiMessageSquare />
                    <span>Text</span>
                  </TypeChooser>
                  <TypeChooser
                    onClick={() => changeType(selectedNodes[0].id!, CHAT_NODE_ANSWER_TYPE)}
                    selected={selectedNodes[0].type === CHAT_NODE_ANSWER_TYPE}
                  >
                    <FiList />
                    <span>Answer</span>
                  </TypeChooser>
                  <TypeChooser
                    onClick={() => changeType(selectedNodes[0].id!, CHAT_NODE_CONDITION_TYPE)}
                    selected={selectedNodes[0].type === CHAT_NODE_CONDITION_TYPE}
                  >
                    <FiHelpCircle />
                    <span>Condition</span>
                  </TypeChooser>
                </TypeChooserWrapper>
                {selectedNodes[0].type !== CHAT_NODE_CONDITION_TYPE && (
                  <Textarea
                    onChange={handleInputChange}
                    name="message"
                    value={selectedNodes[0].data.message}
                  />
                )}
              </SidePanelContent>
              {/* <div>
            {selectedNodes[0].type === CHAT_NODE_TEXT_TYPE && (
              <Button onClick={() => play(selectedChatNodeId!)}>Play</Button>
            )}
          </div> */}
            </SidePanel>
          )}
        </OTopRightUnder>
        <OBottomLeft>
          {selectedWorkspace && (
            <>
              {chatsNames.map((chat) => (
                <FixedButton
                  key={chat.id}
                  icon={<FiMessageSquare />}
                  data={chat.id}
                  value={chat.name!}
                  selected={chat.id === selectedChatId}
                  onClick={setSelectedChatId}
                  onValueChange={changeChatName}
                  onDelete={deleteChat}
                />
              ))}
              <FixedButton icon={<FiPlus />} onClick={addChat} color="add" value="New chat" />
            </>
          )}
        </OBottomLeft>
      </OverlayWrapper>
      {!!selectedChat && (
        <StyledReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              setCharacter,
              characters: characters,
            },
          }))}
          edges={edges.map((edge) => ({
            ...edge,
            data: {
              ...edge.data,
              removeEdge,
            },
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeUpdate={onEdgeUpdate}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onInit={setReactFlowInstance}
          onConnect={onConnect}
          minZoom={0.1}
          maxZoom={4}
        >
          <StyledMiniMap
            nodeBorderRadius={16}
            nodeColor={(node: ChatNode) => COLORS[node.type as ChatNodeTypes]}
          />
          <Background />
          {/* <Controls /> */}
        </StyledReactFlow>
      )}
      <div ref={reactFlowWrapper}>
        <Draggable
          position={{ x: 0, y: 0 }}
          scale={1}
          onStart={onStartDragToAddNewNode}
          // onDrag={this.handleDrag}
          onStop={onEndDragToAddNewNode}
        >
          <CardAdd isAddingNewNode={isAddingNewNode}>
            <ChatNodeCard
              position={{ x: 0, y: 0 }}
              connectable={false}
              id="addNode"
              data={{
                message: 'Add me!',
                character: null,
              }}
            />
          </CardAdd>
        </Draggable>
      </div>
    </>
  );
};

export default Story;

const StyledMiniMap = styled(MiniMap)`
  border-radius: 16px;
`;

const OverlayWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto 1fr auto;
  gap: 10px 10px;
  grid-auto-flow: row;
  grid-template-areas:
    'topLeft . topRight'
    'topLeftUnder . topRightUnder'
    '. . .'
    'bottomLeft . .';
  z-index: 9;
  position: fixed;
  height: 100%;
  width: 100%;
  pointer-events: none;
  padding: 16px;
  & > * > * {
    pointer-events: all;
  }
`;

const OArea = styled.div`
  display: flex;
  gap: 8px;
  color: #424242;
  align-items: flex-start;
  justify-content: flex-start;
`;

const OTopLeft = styled(OArea)`
  grid-area: topLeft;
`;
const OTopLeftUnder = styled(OArea)`
  grid-area: topLeftUnder;
`;
const OTopRight = styled(OArea)`
  grid-area: topRight;
  justify-content: flex-end;
`;
const OTopRightUnder = styled(OArea)`
  grid-area: topRightUnder;
  justify-content: flex-end;
`;
const OBottomLeft = styled(OArea)`
  grid-area: bottomLeft;
  align-items: flex-end;
`;

const lol = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
`;

const CardAdd = styled.div<{ isAddingNewNode: boolean | 'ending' }>`
  position: fixed;
  top: 300px;
  left: ${({ isAddingNewNode }) => (isAddingNewNode === 'ending' ? '-185px' : '-110px')};
  z-index: 99999;
  opacity: 0.6;
  transition: opacity 150ms ease-out,
    left ${({ isAddingNewNode }) => (isAddingNewNode === 'ending' ? 0 : 400)}ms
      cubic-bezier(0.23, 1.48, 0.325, 0.945);
  height: 250px;
  width: 170px;
  padding-top: 40px;
  ${({ isAddingNewNode }) =>
    isAddingNewNode !== 'ending' &&
    css`
      &:hover {
        opacity: 0.8;
        left: -100px;
      }
    `}
  &.react-draggable-dragging {
    & > * {
      transform: rotate(0deg);
    }
  }
  & > * {
    margin-left: -40px;
    transition: ${({ isAddingNewNode }) =>
      isAddingNewNode ? 'none' : 'transform 200ms ease-out'} !important;
    transform: rotate(90deg);
  }
`;

const StyledReactFlow = styled(ReactFlow)`
  width: 100%;
  height: 100vh;
`;

const PlayModeWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(40px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 24px;
  & > div {
    max-width: 90%;
    width: 400px;
  }
`;

const CharacterPlayModeName = styled.div`
  font-weight: bold;
`;

const Button = styled.button<{ red?: boolean }>`
  display: flex;
  margin-top: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  background: ${({ red }) => (red ? 'red' : '#0068f6')};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  align-self: flex-end;
  &:hover {
    background: ${({ red }) => (red ? '#ff5252' : '#0058d3')};
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
  ${({ selected }) =>
    !selected &&
    css`
      color: gray !important;
    `};
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

const SidePanel = styled.div<{ color: string }>`
  width: 360px;
  background: rgba(255, 255, 255, 0.7);
  padding: 25px;
  border-radius: 24px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  border: solid 1px rgba(255, 255, 255, 0.9);
  z-index: 9;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(40px);
  ${ItemTitleBar} {
    background: ${({ color }) => color};
  }
  ${IdTag} {
    color: ${({ color }) => color};
  }
  ${TypeChooser} {
    color: ${({ color }) => color};
  }
  -webkit-user-drag: none;
  & * {
    user-select: none;
    -webkit-user-drag: none;
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
