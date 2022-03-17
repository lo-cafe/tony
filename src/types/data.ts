import {
  CHAT_NODE_CONDITION_TYPE,
  CHAT_NODE_ANSWER_TYPE,
  CHAT_NODE_TEXT_TYPE,
} from '~/constants/variables';

export type ID = string;

export type ChatNodeTypes = typeof CHAT_NODE_CONDITION_TYPE | typeof CHAT_NODE_ANSWER_TYPE | typeof CHAT_NODE_TEXT_TYPE;

export interface ChatNode {
  id: ID;
  message: string;
  type: ChatNodeTypes;
  goesTo: ID[];
  character: ID | null;
  conditions?: ID[];
  x: number;
  y: number;
}

export interface Character {
  id: ID;
  name: string;
  description?: string;
}

export interface Chat {
  id: ID;
  name: string;
  nodes: ChatNode[];
}

export interface Workspace {
  id: ID;
  name: string;
  characters: Character[];
  chats: Chat[];
}

export type DataStructure = Workspace[];
