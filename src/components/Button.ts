import styled from 'styled-components';

const Button = styled.button<{ red?: boolean }>`
  display: block;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  background: ${({ red }) => (red ? 'red' : '#0068f6')};
  border: none;
  padding: 0 16px;
  color: white;
  width: 100%;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background 0.2s ease-out;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  &:hover {
    line-height: 38px;
    border: 1px solid #418df7;
    background: #1874f5;
    outline: none;
    transform: translateY(-1px);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
  }
  &:active {
    line-height: 38px;
    background: #0061e9;
    outline: none;
    transform: translateY(1px);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
  }
`;

export default Button;
