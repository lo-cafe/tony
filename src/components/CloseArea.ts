import styled from 'styled-components';

const CloseArea = styled.button`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
  background-color: transparent;
  opacity: 0;
  z-index: 9999;
`;

export default CloseArea;
