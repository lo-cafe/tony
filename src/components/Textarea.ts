import styled from 'styled-components';
import { lighten, darken } from 'polished';

const Textarea = styled.textarea`
  display: block;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: inherit;
  padding: 0 16px;
  margin-bottom: 16px;
  resize: vertical;
  border: none;
  width: 100%;
  font-family: inherit;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background 0.2s ease-out, font-weight 0.2s ease-out;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  padding: 20px;
  min-height: 200px;
  &:hover {
    background: ${({ theme }) => darken(0.01, theme.colors.inputBg)};
  }
  &:focus {
    font-weight: 700;
    outline: none;
    transform: translateY(-1px);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
    background: ${({ theme }) => lighten(0.1, theme.colors.inputBg)};
  }
`;

export default Textarea;
