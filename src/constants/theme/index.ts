import pallete from '~/constants/colors/pallete';

const theme = {
  colors: {
    bg: pallete.sand,
    text: pallete.mariana,
    accent: pallete.oceano,
    magicAccent: pallete.oceanoWild,
    card: pallete.white,
    placeholder: pallete.placeholder,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
  },
  fontSize: {
    small: '14px',
    normal: '16px',
    medium: '18px',
    large: '24px',
    big: '36px',
  },
};

export default theme;

export type ThemeType = typeof theme;
