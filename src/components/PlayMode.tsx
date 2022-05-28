import { useRef, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { Edge } from '@kinark/react-flow-renderer';

import { ID, ChatNode, Character } from '~/types/data';

import Button from '~/components/Button';

import {
  CHAT_NODE_CONDITION_TYPE,
  CHAT_NODE_ANSWER_TYPE,
  CHAT_NODE_TEXT_TYPE,
} from '~/constants/variables';
import useGetRelatedEdges from '~/hooks/useGetRelatedEdges';

export type WhatToPlay = { toShow: ChatNode; buttons: ChatNode[] } | null;

export interface PlayModeRef {
  play: (selectedNodes?: ChatNode[]) => void
}

interface PlayModeProps {
  characters: Character[];
  whatToPlay: WhatToPlay;
  setWhatToPlay: (whatToPlay: WhatToPlay) => void;
  nodes: ChatNode[];
  edges: Edge[];
}

const PlayMode = forwardRef<PlayModeRef, PlayModeProps>(
  ({ nodes, edges, setWhatToPlay, whatToPlay, characters }, ref) => {
    const answersIds = useRef<ID[]>([]);
    const getRelatedEdges = useGetRelatedEdges(nodes, edges);

    useImperativeHandle(ref, () => ({
      play: (selectedNodes?: ChatNode[]) => {
        if (selectedNodes?.length !== 1) return;
        playFrom(selectedNodes[0]);
      },
    }));

    const playFrom = (firstNode?: ChatNode): void => {
      if (!firstNode) {
        answersIds.current = [];
        return setWhatToPlay(null);
      }
      const getLinkedNodes = (node: ChatNode, handler: 'yes' | 'no' | 'condition' | 'a' = 'a') => {
        const relatedEdges = getRelatedEdges(node.id);
        const nextNodes = nodes.filter((x) =>
          relatedEdges
            .filter((x) => x.source === node.id && x.sourceHandle === handler)
            .map((e) => e.target)
            .includes(x.id)
        );
        return nextNodes;
      };
      const whatToShow = (rawNodes: ChatNode[]): ChatNode[] =>
        rawNodes
          .map((nd) => {
            switch (nd.type) {
              case CHAT_NODE_CONDITION_TYPE:
                const conditionNodeIds = getLinkedNodes(nd, 'condition').map((x) => x.id);
                return conditionNodeIds.every((id) => answersIds.current?.includes(id))
                  ? getLinkedNodes(nd, 'yes')
                      .map((x) => (x.type === CHAT_NODE_CONDITION_TYPE ? whatToShow([x]) : x))
                      .flat()
                  : getLinkedNodes(nd, 'no')
                      .map((x) => (x.type === CHAT_NODE_CONDITION_TYPE ? whatToShow([x]) : x))
                      .flat();
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
          answersIds.current = [...answersIds.current, firstNode.id];
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

    if (!whatToPlay) return null;
    return (
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
    );
  }
);

export default PlayMode;

const PlayModeWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  background-color: ${({ theme }) => theme.colors.blurBg};
  backdrop-filter: blur(35px) saturate(200%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 24px;
  & > div {
    max-width: 90%;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  p {
    margin: 0;
  }
`;

const CharacterPlayModeName = styled.div`
  font-weight: bold;
`;
