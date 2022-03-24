import React from 'react';
import { getBezierPath, getEdgeCenter, getMarkerEnd } from 'react-flow-renderer';
import styled from 'styled-components';

const foreignObjectSize = 40;

export default function CustomEdge({
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
}) {
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

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
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
}

const EdgeButton = styled.button`
  width: 20px;
  height: 20px;
  background: #eee;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
  transition: box-shadow 300ms ease-out, opacity 300ms ease-out;
  /* opacity: 0; */
  &:hover {
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.08);
    opacity: 1;
  }
`;

const EdgeButtonForeignobject = styled.foreignObject`
  body {
    background: transparent;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 40px;
    &
  }
`;
