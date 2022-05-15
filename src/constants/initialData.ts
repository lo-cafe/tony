import { nanoid } from 'nanoid';
import { Edge } from '@kinark/react-flow-renderer';
import randomWords from 'random-words';

import capitalize from '~/utils/capitalize'

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
  name: capitalize(randomWords()),
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
  name: capitalize(randomWords()),
  nodes: [],
  edges: [],
});

export const initialWorkspaceData = (): Workspace => ({
  name: capitalize(randomWords()),
  id: nanoid(ID_SIZE),
  characters: [],
  chats: [initialChatData()],
});

export const initialData: DataStructure = [initialWorkspaceData()];
