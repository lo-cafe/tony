import { useCallback } from 'react';
import memoizee from 'memoizee';
import { Edge } from '@kinark/react-flow-renderer';

import { ID, ChatNode } from '~/types/data';

const useGetRelatedEdges = (nodes: ChatNode[], edges: Edge[]) => {
  const getRelatedEdges = useCallback(
    memoizee((nodeId: ID) => edges.filter((e) => e.source === nodeId || e.target === nodeId)),
    [nodes, edges]
  );
  return getRelatedEdges;
};

export default useGetRelatedEdges;
