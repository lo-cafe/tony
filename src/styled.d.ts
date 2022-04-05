// styled.d.ts
import 'styled-components';

import {Colors} from '~/constants/colors';
import { NodeColors } from '~/instances/userStore';

interface IPalette {
  main: string;
  contrastText: string;
}
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: Colors;
    nodeColors: NodeColors;
  }
}
