// import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { FiMessageSquare, FiList, FiUser, FiHelpCircle, FiGitBranch } from 'react-icons/fi';
import { lighten, getLuminance, darken } from 'polished';

import { ID, ChatNode, ChatNodeTypes, Character } from '~/types/data';

import Title from '~/components/Title';
import SelectableList from '~/components/SelectableList';
import Input from '~/components/Input';
import Textarea from '~/components/Textarea';
import ContextMenuInjector from '~/components/ContextMenuInjector';

import colors from '~/constants/colors';
import {
  CHAT_NODE_CONDITION_TYPE,
  CHAT_NODE_ANSWER_TYPE,
  CHAT_NODE_TEXT_TYPE,
  COLORS,
} from '~/constants/variables';

interface SidePanelProps {
  newEdge: (data: { source: ID; sourceHandle: string; target: ID; targetHandle: string }) => void;
  setCharacter: (targetId: ID, characterId: ID) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  focusOn: (id: ID, spotlight?: boolean) => void;
  nodes: ChatNode[];
  characters: Character[];
  selectedNodes: ChatNode[];
  changeTypes: (targetNds: ChatNode[], type: ChatNodeTypes) => void;
  conditionsBundle: ({ nodes: ID[] } & ChatNode)[];
}

const SidePanel: FC<SidePanelProps> = ({
  newEdge,
  setCharacter,
  handleInputChange,
  focusOn,
  characters,
  nodes,
  selectedNodes,
  changeTypes,
  conditionsBundle,
}) => {
  const theme = useTheme();
  if (!selectedNodes?.length) return null;
  return (
    <Wrapper
      data-testid="side-panel"
      tagColor={
        theme.nodeColors[
          COLORS[selectedNodes[0].type as ChatNodeTypes] as
            | 'answerNode'
            | 'textNode'
            | 'conditionNode'
        ]
      }
    >
      <SidePanelContent>
        {selectedNodes.length > 1 && selectedNodes.length === 1 ? (
          <ItemTitleBar>
            <ItemTitle>
              {selectedNodes[0].type === CHAT_NODE_TEXT_TYPE ? <FiMessageSquare /> : <FiList />}
              {selectedNodes[0].type}
            </ItemTitle>
            <IdTag>{selectedNodes[0].id}</IdTag>
          </ItemTitleBar>
        ) : (
          <Title style={{ margin: 0 }}>{selectedNodes.length} nodes selected</Title>
        )}
        <TypeChooserWrapper>
          <TypeChooser
            onClick={() => changeTypes(selectedNodes, CHAT_NODE_TEXT_TYPE)}
            selected={selectedNodes.every((nd) => nd.type === CHAT_NODE_TEXT_TYPE)}
            data-testid="text-type"
          >
            <FiMessageSquare />
            <span>Text</span>
          </TypeChooser>
          <TypeChooser
            onClick={() => changeTypes(selectedNodes, CHAT_NODE_ANSWER_TYPE)}
            selected={selectedNodes.every((nd) => nd.type === CHAT_NODE_ANSWER_TYPE)}
            data-testid="answer-type"
          >
            <FiList />
            <span>Answer</span>
          </TypeChooser>
          <TypeChooser
            onClick={() => changeTypes(selectedNodes, CHAT_NODE_CONDITION_TYPE)}
            selected={selectedNodes.every((nd) => nd.type === CHAT_NODE_CONDITION_TYPE)}
            data-testid="condition-type"
          >
            <FiHelpCircle />
            <span>Condition</span>
          </TypeChooser>
        </TypeChooserWrapper>
        {selectedNodes.length > 1 &&
          selectedNodes.every((nd) => nd.type !== CHAT_NODE_CONDITION_TYPE) && (
            <ItemBottomBar>
              {selectedNodes.every((nd) => nd.type === CHAT_NODE_ANSWER_TYPE) && (
                <ContextMenuInjector
                  options={nodes
                    .filter((nd) => nd.type === CHAT_NODE_CONDITION_TYPE)
                    ?.map((cond) => ({
                      label: cond.data.name || 'Unamed condition',
                      icon: <FiGitBranch />,
                      selected: selectedNodes.every((nd) =>
                        conditionsBundle?.find((c) => c.id === cond.id)?.nodes.includes(nd.id)
                      ),
                      type: 'item',
                      onClick: () => {
                        selectedNodes.forEach((nd) => {
                          newEdge({
                            source: cond.id,
                            sourceHandle: 'condition',
                            target: nd.id,
                            targetHandle: 'target',
                          });
                        });
                      },
                    }))}
                >
                  <Tag
                    nodeColor={
                      selectedNodes.every((nd) => nd.type === selectedNodes[0].type) &&
                      theme.nodeColors[
                        COLORS[selectedNodes[0].type as ChatNodeTypes] as
                          | 'answerNode'
                          | 'textNode'
                          | 'conditionNode'
                      ]
                    }
                  >
                    <FiGitBranch />
                    <span>
                      {conditionsBundle.filter((cond) =>
                        selectedNodes.map((x) => x.id).every((ndId) => cond.nodes.includes(ndId))
                      ).length || 'Select'}{' '}
                      conditions
                    </span>
                  </Tag>
                </ContextMenuInjector>
              )}
              <ContextMenuInjector
                options={characters.map((char) => ({
                  label: char.name,
                  icon: <FiUser />,
                  type: 'item',
                  onClick: () => {
                    selectedNodes.forEach((nd) => {
                      setCharacter(nd.id, char.id);
                    });
                  },
                }))}
              >
                <Tag
                  nodeColor={
                    selectedNodes.every((nd) => nd.type === selectedNodes[0].type) &&
                    theme.nodeColors[
                      COLORS[selectedNodes[0].type as ChatNodeTypes] as
                        | 'answerNode'
                        | 'textNode'
                        | 'conditionNode'
                    ]
                  }
                >
                  <FiUser />
                  <span>
                    {selectedNodes[0].data.character &&
                    selectedNodes.every(
                      (nd) => nd.data.character === selectedNodes[0].data.character
                    )
                      ? characters.find(({ id }) => id === selectedNodes[0].data.character)!.name
                      : 'Select character'}
                  </span>
                </Tag>
              </ContextMenuInjector>
            </ItemBottomBar>
          )}
        {selectedNodes.length === 1 && selectedNodes[0].type !== CHAT_NODE_CONDITION_TYPE && (
          <Textarea
            onChange={handleInputChange}
            name="message"
            value={selectedNodes[0].data.message}
          />
        )}
        {selectedNodes.length === 1 && selectedNodes[0].type === CHAT_NODE_CONDITION_TYPE && (
          <>
            <Input
              onChange={handleInputChange}
              name="name"
              placeholder="Condition name"
              value={selectedNodes[0].data.name || ''}
            />
            <h4 style={{ margin: 0 }}>Conditions</h4>
            <SelectableList
              style={{ padding: 0, fontSize: 12 }}
              options={
                conditionsBundle
                  .find((cond) => cond.id === selectedNodes[0].id)
                  ?.nodes.map((ndId) => ({
                    label: nodes.find((nd) => nd.id === ndId)!.data.message,
                    icon: <FiList size={16} />,
                    type: 'item',
                    onMouseEnter: () => focusOn(ndId, true),
                    onMouseLeave: () => focusOn(selectedNodes[0].id),
                  })) || []
              }
            />
          </>
        )}
      </SidePanelContent>
    </Wrapper>
  );
};

export default SidePanel;

const ItemBottomBar = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 4px;
`;

const Tag = styled.div<{ nodeColor?: string | false }>`
  background-color: ${({ nodeColor }) => nodeColor || 'gray'};
  padding: 3px 6px;
  border-radius: 8px;
  color: white;
  min-width: 0;
  cursor: pointer;
  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  transition: background-color ${({ theme }) => theme.transitions.normal}ms ease-out;
  &:hover {
    background-color: ${({ nodeColor }) => darken(0.05, nodeColor || 'gray')};
  }
`;

const Discord = styled.img`
  position: fixed;
  right: 230px;
  bottom: 24px;
  z-index: 10;
  height: 24px;
  opacity: 0.5;
  transition: opacity 0.2s ease-out;
  &:hover {
    opacity: 1;
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
  background: ${({ theme }) => theme.colors.inputBlurBg};
  border-radius: 5px;
  padding: 8px;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  ${({ selected }) =>
    !selected &&
    css`
      color: gray !important;
    `};
  &:hover {
    background: ${({ theme }) =>
      getLuminance(theme.colors.bg) > 0.4
        ? darken(0.5, theme.colors.inputBlurBg)
        : lighten(0.1, theme.colors.inputBlurBg)};
  }
`;

const SidePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
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

const Wrapper = styled.div<{ tagColor?: string | false }>`
  width: 360px;
  background: ${({ theme }) => theme.colors.blurBg};
  padding: 25px;
  border-radius: 24px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  border: solid 1px ${({ theme }) => theme.colors.blurBorderColor};
  z-index: 9;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(35px) saturate(200%);
  ${ItemTitleBar}, ${IdTag} {
    background: ${({ tagColor }) => tagColor};
    color: ${({ tagColor }) =>
      getLuminance(tagColor || '#fff') > 0.4 ? colors.light.font : colors.dark.font};
  }
  ${IdTag}, ${TypeChooser} {
    color: ${({ tagColor }) => tagColor || '#fff'};
  }
  -webkit-user-drag: none;
  * {
    user-select: none;
    -webkit-user-drag: none;
  }
`;
