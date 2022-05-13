import styled from 'styled-components';
import { transparentize } from 'polished';

interface ToggleProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  height?: number;
  label?: string;
}

const Toggle: FC<ToggleProps> = ({ checked, onChange, height, label, ...rest }) => (
  <ToggleWrapper height={height || 24} active={checked} {...rest}>
    {label}
    <div />
    <input type="checkbox" checked={checked} onChange={onChange} />
  </ToggleWrapper>
);

export default Toggle;

const ToggleWrapper = styled.label<{ active: boolean; height: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  input {
    position: fixed;
    opacity: 0;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
  }
  div {
    margin-left: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: none;
    width: ${({ height }) => (height - height * 0.125 * 2) * 2 + height * 0.125 + height * 0.02}px;
    height: ${({ height }) => height}px;
    cursor: pointer;
    border-radius: 100px;
    border: 1px solid
      ${({ theme, active }) =>
        active ? theme.nodeColors.accent : transparentize(0.5, theme.colors.font)};
    background: ${({ theme, active }) => (active ? theme.nodeColors.accent : 'transparent')};
    transition: background ${({ theme }) => theme.transitions.quick}ms ease-out;
    padding: ${({ height }) => height * 0.125}px;
    position: relative;
    &::after {
      content: '';
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: none;
      aspect-ratio: 1;
      height: 100%;
      width: auto;
      border-radius: 50%;
      top: 3px;
      background: ${({ theme, active }) =>
        active ? 'white' : transparentize(0.5, theme.colors.font)};
      transition: ${({ theme: { transitions } }) =>
        `transform ${transitions.quick}ms ease-out, background ${transitions.quick}ms ease-out, box-shadow ${transitions.quick}ms ease-out`};
      transform: ${({ active }) => (active ? 'translateX(100%)' : 'translateX(0%)')};
      box-shadow: ${({ active, height }) =>
        active
          ? `0px ${height * 0.0625}px ${height * 0.0625 * 2.66}px 0px rgba(0,0,0,.5);`
          : 'none'};
    }
  }
`;
