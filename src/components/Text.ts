import styled from 'styled-components';

import { ThemeType } from '~/constants/theme';

interface TextProps {
  color?: keyof ThemeType['colors'];
  size?: keyof ThemeType['fontSize'];
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  align?: 'left' | 'center' | 'right';
}

const Text = styled.div<TextProps>`
  color: ${({ theme, color = 'text' }) =>
    color === 'magicAccent' ? theme.colors.text : theme.colors[color]};
  font-size: ${({ theme, size = 'normal' }) => theme.fontSize[size]};
  font-weight: ${({ weight = 600 }) => weight};
  text-align: ${({ align = 'left' }) => align};
  background: ${({ theme, color }) =>
    color === 'magicAccent' ? theme.colors[color] : 'transparent'};
  -webkit-background-clip: ${({ color }) => (color === 'magicAccent' ? 'text' : 'unset')};
  -webkit-text-fill-color: ${({ color }) => (color === 'magicAccent' ? 'transparent' : 'unset')};
`;

export default Text;
