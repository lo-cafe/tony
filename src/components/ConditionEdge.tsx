import { getBezierPath, getEdgeCenter, EdgeProps } from '@kinark/react-flow-renderer';
import styled from 'styled-components';

import useUserStore from '~/instances/userStore';

const foreignObjectSize = 40;

const ConditionEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const showConditionsConnections = useUserStore((s) => s.preferences.showConditionsConnections);
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // const onEdgeClick = (evt, id) => {
  //   evt.stopPropagation();
  //   data.removeEdge(id);
  // };

  if (!showConditionsConnections) return null;

  return (
    <>
      <VisibleEdge
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd as string}
      />
      <HiddenEdge
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd as string}
      />
      {/* {selected && (
        <EdgeButtonForeignobject
          width={foreignObjectSize}
          height={foreignObjectSize}
          x={edgeCenterX - foreignObjectSize / 2}
          y={edgeCenterY - foreignObjectSize / 2}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <body>
            <EdgeButton onClick={(event) => onEdgeClick(event, id)}>×</EdgeButton>
          </body>
        </EdgeButtonForeignobject>
      )} */}
    </>
  );
};

export default ConditionEdge;

const VisibleEdge = styled.path`
  opacity: 0.5;
  stroke-dasharray: 10 !important;
`;

const HiddenEdge = styled.path`
  fill: none;
  stroke: transparent !important;
  stroke-dasharray: 0 !important;
  stroke-width: 12;
  animation: none !important;
  cursor: pointer;
  transition: stroke 0.2s ease-out;
  &:hover {
    stroke: rgba(0, 0, 0, 0.05) !important;
  }
`;

const EdgeButton = styled.button`
  width: 20px;
  height: 20px;
  background: #eee;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
  transition: box-shadow ${({ theme }) => theme.transitions.normal}ms ease-out,
    opacity ${({ theme }) => theme.transitions.normal}ms ease-out;
  /* opacity: 0; */
  &:hover {
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.08);
    opacity: 1;
  }
`;

// const EdgeButtonForeignobject = styled.foreignObject`
//   body {
//     background: transparent;
//     width: 40px;
//     height: 40px;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     min-height: 40px;
//     &
//   }
// `;
