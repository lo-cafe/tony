import styled from 'styled-components';
import { getLuminance } from 'polished';

import useUserStore from '~/instances/userStore';

import Title from '~/components/Title';
import Toggle from '~/components/Toggle';

const Appearence = () => {
  const { showNodeIds, showConditionsConnections, duplicateEdgesWhenAltDragging } = useUserStore(
    (s) => s.preferences
  );
  const setPreferences = useUserStore((s) => s.setPreferences);

  return (
    <div>
      <Title style={{ marginTop: 0 }}>About Tony</Title>
      <div>
        <div>
          Created with ❤️ by{' '}
          <Link target="_blank" href="https://www.craft.do/s/7Jm2QcXRry23LT">
            Igor Marcossi
          </Link>
          .
        </div>
        <div>
          App v
          {VITE_VERCEL_ENV === 'production'
            ? __APP_VERSION__
            : '-Development'}
        </div>
      </div>
    </div>
  );
};

export default Appearence;

const Link = styled.a`
  color: inherit;
`;
