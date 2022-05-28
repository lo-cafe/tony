import styled from 'styled-components';
import { getLuminance } from 'polished';

import useUserStore from '~/instances/userStore';

import Title from '~/components/Title';
import Toggle from '~/components/Toggle';

const Appearence = () => {
  const { showNodeIds, showConditionsConnections, duplicateEdgesWhenAltDragging } = useUserStore((s) => s.preferences);
  const setPreferences = useUserStore((s) => s.setPreferences);

  return (
    <div>
      <Title style={{ marginTop: 0 }}>App</Title>
      <List>
        <li>
          <Toggle
            label="Show IDs in nodes"
            checked={showNodeIds}
            onChange={(e) => setPreferences({ showNodeIds: e.target.checked })}
          />
        </li>
        <li>
          <Toggle
            label="Show conditions connections"
            checked={showConditionsConnections}
            onChange={(e) => setPreferences({ showConditionsConnections: e.target.checked })}
          />
        </li>
        <li>
          <Toggle
            label="Duplicate connections too"
            checked={duplicateEdgesWhenAltDragging}
            onChange={(e) => setPreferences({ duplicateEdgesWhenAltDragging: e.target.checked })}
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
  border-radius: 8px;
  flex: 1;
  padding: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  user-select: none;
  background: ${({ theme }) =>
    getLuminance(theme.colors.blurBg) > 0.3 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'};
  li {
    border-bottom: solid rgba(127, 127, 127, 0.2) 1px;
    list-style: none;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    & > * {
      padding: 8px 16px;
      width: 100%;
      transition: background ${({ theme }) => theme.transitions.quick}ms ease-out;
      &:hover {
        background: ${({ theme }) =>
          getLuminance(theme.colors.blurBg) > 0.3 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'};
      }
    }
    &:last-child {
      border-bottom: none;
    }
  }
`;
