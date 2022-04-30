import styled from 'styled-components';

import useUserStore from '~/instances/userStore';

import Title from '~/components/Title';
import Toggle from '~/components/Toggle';

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
