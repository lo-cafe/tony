import styled from 'styled-components';
import { transparentize } from 'polished';

import useUserStore from '~/instances/userStore';

import Button from '~/components/Button';

import Title from '../Title';

const Appearence = () => {
  const { showNodeIds } = useUserStore((s) => s.preferences);
  const setPreferences = useUserStore((s) => s.setPreferences);

  return (
    <div>
      <Title style={{ marginTop: 0 }}>App</Title>
      <List>
        <li>
          Show IDs in nodes
          <Toggle
            checked={showNodeIds}
            onChange={(e) => setPreferences({ showNodeIds: e.target.checked })}
          />
        </li>
      </List>
    </div>
  );
};

export default Appearence;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  padding: 0;
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  li {
    list-style: none;
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
`;

interface ToggleProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toggle: FC<ToggleProps> = ({ checked, onChange }) => (
  <ToggleWrapper active={checked}>
    <div />
    <input type="checkbox" checked={checked} onChange={onChange} />
  </ToggleWrapper>
);

const ToggleWrapper = styled.label<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  width: 42px;
  height: 24px;
  cursor: pointer;
  border-radius: 100px;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.nodeColors.accent : transparentize(0.5, theme.colors.font)};
  background: ${({ theme, active }) => (active ? theme.nodeColors.accent : 'transparent')};
  transition: background ${({ theme }) => theme.transitions.quick}ms ease-out;
  padding: 3px;
  position: relative;
  input {
    position: fixed;
    opacity: 0;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
  }
  div {
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
    transition: transform ${({ theme }) => theme.transitions.quick}ms ease-out,
      background ${({ theme }) => theme.transitions.quick}ms ease-out;
    transform: ${({ active }) => (active ? 'translateX(100%)' : 'translateX(0%)')};
  }
`;

const StyledButton = styled(Button)`
  margin-top: 16px;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Label = styled.label`
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const ColorsWrapper = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
`;

const ThemeChooserImg = styled.img<{ active: boolean }>`
  height: 60px;
  opacity: ${({ active }) => (active ? 1 : 0.25)};
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.35));
  cursor: pointer;
  transition: opacity 0.2s ease-out;
  &:hover {
    opacity: 0.75;
  }
`;
