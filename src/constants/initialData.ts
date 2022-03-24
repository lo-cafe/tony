import { nanoid } from 'nanoid';
import { Edge } from 'react-flow-renderer';

import {
  ID,
  ChatNode,
  Character,
  Chat,
  Workspace,
  DataStructure,
  ChatNodeTypes,
} from '~/types/data';
import { CHAT_NODE_TEXT_TYPE, ID_SIZE } from '~/constants/variables';

export const initialCharacterData = (): Character => ({
  id: nanoid(ID_SIZE),
  name: 'Char 1',
  description: '',
});

export const initialChatNodeData = (x = 444, y = 202): ChatNode => ({
  id: nanoid(ID_SIZE),
  type: CHAT_NODE_TEXT_TYPE,
  data: {
    message: 'Enter text...',
    character: null,
    isCopy: false,
  },
  position: {
    x,
    y,
  },
});

const firstCharacter = initialCharacterData();
const firstNode = initialChatNodeData();
const secondNode = initialChatNodeData(520, 300);

export const initialEdge = (source: ID, target: ID): Edge => ({
  id: nanoid(ID_SIZE),
  source,
  target,
  animated: true,
  type: 'button',
});

export const initialChatData = (): Chat => ({
  id: nanoid(ID_SIZE),
  name: 'New Chat',
  nodes: [],
  edges: [],
});

export const initialWorkspaceData = (): Workspace => ({
  name: 'New Workspace',
  id: nanoid(ID_SIZE),
  characters: [],
  chats: [initialChatData()],
});

export const initialData: DataStructure = [initialWorkspaceData()];
