export type Colors = typeof light;

export const light = {
  bg: '#fff',
  cardBg: '#fff',
  inputBg: '#fafafa',
  inputBlurBg: 'rgba(80,80,80,0.1)',
  conditionResultWrapperBg: '#f5f5f5',
  blurBg: 'rgba(255,255,255,0.7)',
  blurBorderColor: 'rgba(255,255,255,0.8)',
  font: '#424242',
};

export const dark: Colors = {
  bg: '#212121',
  cardBg: '#2e2e2e',
  inputBg: '#424242',
  inputBlurBg: 'rgba(80,80,80,0.5)',
  conditionResultWrapperBg: '#676767',
  blurBg: 'rgba(60, 60, 60, 0.7)',
  blurBorderColor: 'rgba(255,255,255,0.1)',
  font: '#fff',
};

export default { light, dark };
