import { nanoid } from 'nanoid';

import {
  ID,
  ChatNode,
  Character,
  Chat,
  Workspace,
  DataStructure,
  ChatNodeTypes,
} from '~/types/data';
import { CHAT_NODE_TEXT_TYPE } from '~/constants/variables';

export const IDS_SIZE = 8;

export const initialCharacterData = (): Character => ({
  id: nanoid(8),
  name: 'Char 1',
  description: '',
});

export const initialChatNodeData = (): ChatNode => ({
  id: nanoid(8),
  message: 'Enter text...',
  type: CHAT_NODE_TEXT_TYPE,
  goesTo: [],
  character: initialCharacterData().id,
  x: 444,
  y: 202,
});

export const initialChatData = (): Chat => ({
  id: nanoid(IDS_SIZE),
  name: 'New Chat',
  nodes: [initialChatNodeData()],
});

export const initialWorkspaceData = (): Workspace => ({
  name: 'New Workspace',
  id: nanoid(IDS_SIZE),
  characters: [initialCharacterData()],
  chats: [initialChatData()],
});

export const initialData: DataStructure = [initialWorkspaceData()];
