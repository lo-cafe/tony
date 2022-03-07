export type ID = string;

export type ChatNodeType = 'text' | 'answer';

export interface ChatNode {
  id: ID;
  message: string;
  type: ChatNodeType;
  goesTo: ID[];
  character: ID | null;
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
