export const colorsPalette = {
  primary: '#000',
  secondary: '#CCC',
  ligth: '#FFF',
  gray: '#ADB3B3',
  dark: '#4B4C4C',
};

const tintColorLight = '#2f95dc';
const tintColorDark = '#E7E7E7';

export default {
  light: {
    text: '#0D0D0D',
    background: '#F2F2F4',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    red: '#EF4444',
    messageFrom: '#0171F4',
    messageTo: '#54A0FA',
  },
  dark: {
    text: '#F2F2F4',
    background: '#0D0D0D',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    red: '#EF4444',
    messageFrom: '#8638D1',
    messageTo: '#B96FFE',
  },
};
