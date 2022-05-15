import { Node, Edge } from '@kinark/react-flow-renderer';

import {
  CHAT_NODE_CONDITION_TYPE,
  CHAT_NODE_ANSWER_TYPE,
  CHAT_NODE_TEXT_TYPE,
} from '~/constants/variables';

export type ID = string;

export type ChatNodeTypes =
  | typeof CHAT_NODE_CONDITION_TYPE
  | typeof CHAT_NODE_ANSWER_TYPE
  | typeof CHAT_NODE_TEXT_TYPE;

export interface ChatNodeData {
  message: string;
  character: ID | null;
  name?: string | null;
  isCopy?: boolean;
}

export type ChatNode = Node<ChatNodeData>;

export interface Character {
  id: ID;
  name: string;
  description?: string;
}

export interface Chat {
  id: ID;
  name: string;
  nodes: ChatNode[];
  edges: Edge[];
}

export interface Workspace {
  id: ID;
  name: string;
  characters: Character[];
  chats: Chat[];
}

export type DataStructure = Workspace[];
