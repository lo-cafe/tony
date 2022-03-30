import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { nanoid } from 'nanoid';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import {
  FiMessageSquare,
  FiList,
  FiPlus,
  FiBox,
  FiUser,
  FiHelpCircle,
  FiPlay,
  FiCornerLeftUp,
  FiCornerLeftDown,
  FiUpload,
} from 'react-icons/fi';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  useKeyPress,
  MiniMap,
  updateEdge,
  Background,
  useViewport,
  ReactFlowInstance,
  useUpdateNodeInternals,
} from 'react-flow-renderer';
import { getFirestore, getDoc, setDoc, doc, onSnapshot } from 'firebase/firestore';
import useUserStore from '~/instances/userStore';

import {
  ID,
  ChatNode,
  Character,
  Chat,
  Workspace,
  DataStructure,
  ChatNodeTypes,
} from '~/types/data';

import discordIcon from '~/components/discord.svg';
import LoginWidget from '~/components/LoginWidget';
import CustomEdge from '~/components/CustomEdge';
import FixedButton from '~/components/FixedButton';
import ChatNodeCard from '~/components/ChatNodeCard';
import ConditionNodeCard from '~/components/ConditionNodeCard';
import FScreenListing from '~/components/FScreenListing';
import {
  CHAT_NODE_CONDITION_TYPE,
  CHAT_NODE_ANSWER_TYPE,
  CHAT_NODE_TEXT_TYPE,
  ID_SIZE,
  COLORS,
} from '~/constants/variables';
import downloadFile from '~/utils/downloadFile';
import { Optional } from '~/types/utils';
import {
  initialCharacterData,
  initialChatNodeData,
  initialChatData,
  initialWorkspaceData,
} from '~/constants/initialData';
import { initFirebase } from '~/instances/firebase';

initFirebase();

const db = getFirestore();

type WorkspacesNames = Optional<Workspace, 'characters' | 'chats'>;
type ChatNames = Optional<Chat, 'nodes' | 'edges'>;

const nodeTypes = { text: ChatNodeCard, condition: ConditionNodeCard, answer: ChatNodeCard };
const edgeTypes = { button: CustomEdge };

const _loadOrSave = (data?: DataStructure): DataStructure => {
  if (typeof window === 'undefined') return [];
  if (data) {
    localStorage.setItem('datav2', JSON.stringify(data));
    return data;
  }
  const storedData = localStorage.getItem('datav2');
  return !storedData || !JSON.parse(storedData).length ? [] : JSON.parse(storedData);
};

const Story = () => {
  const loggedUserId = useUserStore((s) => s.uid);
  const debounceCloudSave = useRef<any>(null);

  const loadOrSave = (newData?: DataStructure) => {
    if (newData) {
      clearTimeout(debounceCloudSave.current);
      debounceCloudSave.current = setTimeout(() => {
        _loadOrSave(newData);
        if (loggedUserId) {
          setDoc(doc(db, 'usersData', loggedUserId), { data: data.current });
        }
      }, 300);
      return newData;
    }
    return _loadOrSave();
  };

  const loadedData = useRef(loadOrSave());

  const altPressed = useKeyPress('AltLeft');
  const updateNodeInternals = useUpdateNodeInternals();
  const data = useRef<DataStructure>(loadedData.current!);
  const [workspacesNames, _setWorkspacesNames] = useState<WorkspacesNames[]>(
    data.current.map(({ id, name }) => ({ id, name }))
  );
  const [characters, setCharacters] = useState<Character[]>(data.current[0]?.characters);
  const [chatsNames, _setChatsNames] = useState<ChatNames[]>(
    data.current[0]?.chats.map(({ id, name }) => ({ id, name }))
  );
  const [nodes, setNodes] = useState<ChatNode[]>(data.current[0]?.chats[0]?.nodes);
  const [edges, setEdges] = useState<Edge[]>(data.current[0]?.chats[0]?.edges);
  const { zoom } = useViewport();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<ID | null>(
    !!loadedData.current && !!loadedData.current[0] ? loadedData.current[0].id : null
  );
  const [selectedChatId, setSelectedChatId] = useState<ID | null>(
    !!loadedData.current && !!loadedData.current[0] && !!loadedData.current[0].chats[0]
      ? loadedData.current[0].chats[0].id
      : null
  );
  const [isAddingNewNode, setIsAddingNewNode] = useState<boolean | 'ending'>(false);

  const [whatToPlay, setWhatToPlay] = useState<{ toShow: ChatNode; buttons: ChatNode[] } | null>(
    null
  );

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef(null);
  const lastCopied = useRef<null | Node>(null);
  const playModeAnswersIds = useRef<ID[]>([]);
  const newItemRef = useRef(null);

  const setChatsNames = (newChats: (old: ChatNames[]) => ChatNames[]) =>
    _setChatsNames((old) => newChats(old).map(({ id, name }) => ({ id, name })));

  const setWorkspacesNames = (newWorkspaces: (old: WorkspacesNames[]) => WorkspacesNames[]) =>
    _setWorkspacesNames((old) => newWorkspaces(old).map(({ id, name }) => ({ id, name })));

  const getSelectedWorkspace = (obj: DataStructure): Workspace | null =>
    obj.find((w) => w.id === selectedWorkspaceId) || null;

  const getSelectedChat = (obj: DataStructure): Chat | null =>
    getSelectedWorkspace(obj)?.chats.find((c) => c.id === selectedChatId) || null;

  const getRelatedEdges = (nodeId: ID, edges: Edge[]) =>
    edges.filter((e) => e.source === nodeId || e.target === nodeId);

  const selectedWorkspace = getSelectedWorkspace(data.current);
  const selectedChat = getSelectedChat(data.current);
  const selectedNodes = useMemo(() => nodes && nodes.filter((x) => x.selected), [nodes]);

  useEffect(() => {
    if (!loggedUserId) return;
    const fetchData = async () => {
      const retrievedDoc = await getDoc(doc(db, 'usersData', loggedUserId));
      if (!retrievedDoc.data() || !retrievedDoc.data()!.data) return;
      const mergedDatas = [
        ...data.current,
        ...retrievedDoc
          .data()!
          .data.filter((x: Workspace) => !data.current.find((el) => x.id === el.id)),
      ];
      data.current = mergedDatas;
      updateMirrors();
      loadOrSave(data.current);
    };
    fetchData();
  }, [loggedUserId]);

  useEffect(() => {
    if (!selectedChatId || !getSelectedChat(data.current)) return;
    getSelectedChat(data.current)!.nodes = nodes;
    loadOrSave(data.current);
  }, [nodes]);

  useEffect(() => {
    if (!selectedChatId || !getSelectedChat(data.current)) return;
    getSelectedChat(data.current)!.edges = edges;
    loadOrSave(data.current);
  }, [edges]);

  useEffect(() => {
    if (!selectedChatId || !getSelectedWorkspace(data.current)) return;
    getSelectedWorkspace(data.current)!.characters = characters;
    loadOrSave(data.current);
  }, [characters]);

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const selectedWorkspaceChats = getSelectedWorkspace(data.current)?.chats;
    if (!selectedWorkspaceChats) return;
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

  const updateMirrors = () => {
    setWorkspacesNames(() => data.current || []);
    setChatsNames(() => getSelectedWorkspace(data.current)?.chats || []);
    setNodes(selectedChatId ? getSelectedChat(data.current)?.nodes || [] : []);
    setEdges(selectedChatId ? getSelectedChat(data.current)?.edges || [] : []);
  };

  useEffect(() => {
    updateMirrors();
  }, [selectedChatId, selectedWorkspaceId]);

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

  const deleteChat = (targetId: ID) => {
    if (!selectedWorkspace || !targetId) return;
    if (targetId === selectedChatId) setSelectedChatId(null);
    _setChatsNames((old) => old.filter(({ id }) => id !== targetId));
  };

  const deleteWorkspace = (targetId: ID) => {
    if (!targetId) return;
    if (targetId === selectedWorkspaceId) {
      setSelectedChatId(null);
      setSelectedWorkspaceId(null);
    }
    _setWorkspacesNames((old) => old.filter(({ id }) => id !== targetId));
  };

  const deleteChar = (targetId: ID) => {
    if (!selectedWorkspace) return;
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
    const newChat = initialChatData();
    setChatsNames((old) => [...old, newChat]);
    setSelectedChatId(newChat.id);
  };

  const addWorkspace = () => {
    const newWorkspace = initialWorkspaceData();
    setWorkspacesNames((old) => [...old, newWorkspace]);
    setSelectedWorkspaceId(newWorkspace.id);
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
          tonyData: {
            position: nd.position,
          },
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

  const importFromJson = (ref: React.RefObject<HTMLInputElement>, _e: any) => {
    const e = _e;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newWorkspace = JSON.parse(event.target?.result as string);
      if (!newWorkspace) return;
      try {
        const transformedData: Workspace = {
          ...newWorkspace,
          chats: newWorkspace.chats.map(
            (ch: any): Chat => ({
              ...ch,
              nodes: ch.nodes.map(
                (nd: any): ChatNode => ({
                  id: nd.id,
                  type: nd.type,
                  position: nd.tonyData.position,
                  data: {
                    message: nd.message,
                    character: nd.character,
                  },
                })
              ),
              edges: ch.nodes
                .map(
                  (nd: any): Edge =>
                    nd.type === CHAT_NODE_CONDITION_TYPE
                      ? [
                          ...nd.goesTo.conditions.map((g: ID) => ({
                            id: nanoid(ID_SIZE),
                            source: nd.id,
                            target: g,
                          })),
                          ...nd.goesTo.yes.map((g: ID) => ({
                            id: nanoid(ID_SIZE),
                            source: nd.id,
                            target: g,
                          })),
                          ...nd.goesTo.no.map((g: ID) => ({
                            id: nanoid(ID_SIZE),
                            source: nd.id,
                            target: g,
                          })),
                        ]
                      : nd.goesTo.map((g: ID) => ({
                          id: nanoid(ID_SIZE),
                          source: nd.id,
                          target: g,
                        }))
                )
                .flat(),
            })
          ),
        };
        setWorkspacesNames((old) => [
          ...old,
          { id: transformedData.id, name: transformedData.name },
        ]);
        data.current = [...data.current, transformedData];
        ref.current!.value = '';
      } catch (error) {
        console.log(error);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(e.target.files[0]);
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
    newNode.position = reactFlowInstance.project({
      x: info.x - 140,
      y: info.y + window.innerHeight - 70 - 40 - 170,
    });
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
    if (!selectedNodes || selectedNodes.length !== 1) return;
    playFrom(selectedNodes[0]);
  };

  const resetZoom = () => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomTo(1, { duration: 500 });
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
          <FScreenListing
            numberOfRecentItems={2}
            listName="Workspaces"
            items={workspacesNames}
            icon={<FiBox />}
            selectedItemId={selectedWorkspaceId}
            onItemClick={setWorkspace}
            onItemValueChange={changeWorkspaceName}
            onItemDelete={deleteWorkspace}
            onItemDownload={exportToJson}
            extraOptions={[
              {
                value: 'New workspace',
                icon: <FiPlus />,
                color: 'add',
                onClick: addWorkspace,
              },
              {
                value: 'Import workspace',
                icon: <FiUpload />,
                color: 'add',
                discrete: false,
                onFileChange: importFromJson,
              },
            ]}
          />
        </OTopLeft>
        <OTopLeftUnder>
          {selectedWorkspace && characters && (
            <FScreenListing
              listName="Characters"
              items={characters}
              numberOfRecentItems={0}
              icon={<FiUser />}
              onItemValueChange={changeCharName}
              onItemDelete={deleteChar}
              extraOptions={[
                {
                  value: 'New character',
                  icon: <FiPlus />,
                  color: 'add',
                  onClick: addChar,
                  discrete: true,
                },
              ]}
            />
          )}
        </OTopLeftUnder>
        <OTopRight>
          <FixedButton
            disabled={!selectedNodes || selectedNodes.length !== 1}
            icon={<FiPlay />}
            onClick={play}
            color="add"
            value="Play"
          />
          {/* <FixedButton
            onClick={() => {
              if (!window.confirm('Are you really sure?')) return;
              localStorage.removeItem('data');
              data.current = loadOrSave();
            }}
            color="delete"
            icon={<FiTrash2 />}
            value="Erase all data"
          /> */}
          <ZoomButton onClick={resetZoom} value={`${(zoom * 100).toFixed(0)}%`} />
          <LoginWidget />
        </OTopRight>
        <OTopRightUnder>
          {selectedNodes && selectedNodes.length === 1 && (
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
            <FScreenListing
              listName="Chats"
              items={chatsNames}
              icon={<FiMessageSquare />}
              selectedItemId={selectedChatId}
              onItemClick={setSelectedChatId}
              onItemValueChange={changeChatName}
              onItemDelete={deleteChat}
              extraOptions={[
                {
                  value: 'New chat',
                  icon: <FiPlus />,
                  color: 'add',
                  onClick: addChat,
                },
              ]}
            />
          )}
        </OBottomLeft>
      </OverlayWrapper>
      {(!selectedChatId || !selectedWorkspaceId) && (
        <BackgroundTip bottomArrow={!!selectedWorkspaceId}>
          <span>{!selectedWorkspaceId ? <FiCornerLeftUp /> : <FiCornerLeftDown />}</span>
          Select or create a {!selectedWorkspaceId ? 'workspace' : 'chat'}
        </BackgroundTip>
      )}
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
          selectNodesOnDrag={false}
          minZoom={0.1}
          maxZoom={4}
        >
          <StyledMiniMap
            nodeBorderRadius={16}
            nodeColor={(node: ChatNode) => COLORS[node.type as ChatNodeTypes]}
          />
          <Background />
        </StyledReactFlow>
      )}
      <div ref={reactFlowWrapper}>
        {selectedWorkspaceId && selectedChatId && (
          <Draggable
            position={{ x: 0, y: 0 }}
            scale={1}
            onStart={onStartDragToAddNewNode}
            onStop={onEndDragToAddNewNode}
            nodeRef={newItemRef}
          >
            <CardAdd ref={newItemRef} isAddingNewNode={isAddingNewNode}>
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
        )}
      </div>
      <a href="https://discord.gg/YgZSgp8kVR" target="_blank">
        <Discord src={discordIcon} alt="Discord Server" />
      </a>
    </>
  );
};

export default Story;

const Discord = styled.img`
  position: fixed;
  right: 235px;
  bottom: 24px;
  z-index: 10;
  height: 40px;
  opacity: 0.2;
  transition: opacity 0.2s ease-in-out;
  &:hover {
    opacity: 0.65;
  }
`;

const BackgroundTip = styled.div<{ bottomArrow?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  z-index: -1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #c5c5c5;
  font-weight: 700;
  span {
    left: 24px;
    font-size: 72px;
    position: absolute;
    line-height: 0;
    top: ${({ bottomArrow }) => (bottomArrow ? 'unset' : '64px')};
    bottom: ${({ bottomArrow }) => (bottomArrow ? '64px' : 'unset')};
  }
`;

const ZoomButton = styled(FixedButton)`
  width: 69px;
  text-align: center;
  justify-content: center;
`;

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
    'topLeftUnder topRightUnder topRightUnder'
    '. . .'
    'bottomLeft . .';
  z-index: 11;
  position: fixed;
  height: 100%;
  width: 100%;
  pointer-events: none;
  padding: 16px;
  * > * {
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

const CardAdd = styled.div<{ isAddingNewNode: boolean | 'ending' }>`
  position: fixed;
  bottom: 70px;
  left: ${({ isAddingNewNode }) => (isAddingNewNode === 'ending' ? '-185px' : '-110px')};
  z-index: 10;
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
  border: solid 1px rgba(255, 255, 255, 0.8);
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
