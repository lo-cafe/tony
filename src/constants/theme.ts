import useUserStore from '~/instances/userStore';

import colors from './colors';

const theme = (colorTheme: 'dark' | 'light' = 'light') => {
  const { nodeColors } = useUserStore.getState();
  return {
    transitions: {
      superQuick: 150,
      quick: 200,
      normal: 300,
      slow: 400,
      superSlow: 500,
    },
    colors: colors[colorTheme],
    nodeColors: nodeColors[colorTheme],
  };
};

export default theme;

export type Theme = ReturnType<typeof theme>;
