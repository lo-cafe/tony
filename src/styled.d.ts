// styled.d.ts
import 'styled-components';

import { Colors } from '~/constants/colors';
import { NodeColors } from '~/instances/userStore';
import { Theme } from '~/constants/theme';

interface IPalette {
  main: string;
  contrastText: string;
}
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
