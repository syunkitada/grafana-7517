import defaultTheme, { commonColorsPalette } from './default';
import { GrafanaThemeType, GrafanaTheme } from '@grafana/data';

const basicColors = {
  ...commonColorsPalette,
  black: '#000000',
  white: '#ffffff',
  dark1: '#1e2028',
  dark2: '#41444b',
  dark3: '#303133', // not used in light theme
  dark4: '#35373f', // not used in light theme
  dark5: '#41444b', // not used in light theme
  dark6: '#41444b', // not used in light theme
  dark7: '#41444b', // not used in light theme
  dark8: '#2f2f32', // not used in light theme
  dark9: '#343436', // not used in light theme
  dark10: '#424345', // not used in light theme
  gray1: '#52545c',
  gray2: '#767980',
  gray3: '#acb6bf',
  gray4: '#c7d0d9',
  gray5: '#dde4ed',
  gray6: '#e9edf2', // same as gray95
  gray7: '#f7f8fa', // same as gray98
  blueBase: '#3274d9',
  blueShade: '#1f60c4',
  blueLight: '#5794f2',
  blueFaint: '#f5f9ff',
  redBase: '#e02f44',
  redShade: '#c4162a',
  greenBase: '#3eb15b',
  greenShade: '#369b4f',
  blue: '#0083b3',
  red: '#d44939',
  yellow: '#ff851b',
  purple: '#9954bb',
  orange: '#ff7941',
  orangeDark: '#ed5700',
};

const backgrounds = {
  bg1: basicColors.white,
  bg2: basicColors.gray98,
  bg3: basicColors.gray95,
  dashboardBg: basicColors.gray98,
};

const borders = {
  border1: basicColors.gray95,
  border2: basicColors.gray85,
};

const form = {
  formLabel: basicColors.gray33,
  formDescription: basicColors.gray33,
  formLegend: basicColors.gray25,
  formInputBg: basicColors.white,
  formInputBgDisabled: basicColors.gray95,
  formInputBorder: basicColors.gray85,
  formInputBorderHover: basicColors.gray70,
  formInputBorderActive: basicColors.blue77,
  formInputBorderInvalid: basicColors.red88,
  formInputText: basicColors.gray25,
  formInputPlaceholderText: basicColors.gray70,
  formInputDisabledText: basicColors.gray33,
  formInputTextStrong: basicColors.gray25,
  formInputTextWhite: basicColors.white,
  formFocusOutline: basicColors.blueLight,
  formValidationMessageText: basicColors.white,
  formValidationMessageBg: basicColors.red88,
  formSwitchBg: basicColors.gray85,
  formSwitchBgActive: basicColors.blueShade,
  formSwitchBgHover: basicColors.gray3,
  formSwitchBgActiveHover: basicColors.blueBase,
  formSwitchBgDisabled: basicColors.gray4,
  formSwitchDot: basicColors.white,
  formCheckboxBg: basicColors.white,
  formCheckboxBgChecked: basicColors.blueShade,
  formCheckboxBgCheckedHover: basicColors.blueBase,
  formCheckboxCheckmark: basicColors.white,
};

const lightTheme: GrafanaTheme = {
  ...defaultTheme,
  type: GrafanaThemeType.Light,
  isDark: false,
  isLight: true,
  name: 'Grafana Light',
  palette: {
    ...basicColors,
    brandPrimary: basicColors.orange,
    brandSuccess: basicColors.greenBase,
    brandWarning: basicColors.orange,
    brandDanger: basicColors.redBase,
    queryRed: basicColors.redBase,
    queryGreen: basicColors.greenBase,
    queryPurple: basicColors.purple,
    queryOrange: basicColors.orange,
    online: basicColors.greenShade,
    warn: '#f79520',
    critical: basicColors.redShade,
  },
  colors: {
    ...backgrounds,
    ...borders,

    bodyBg: backgrounds.bg1,
    panelBg: backgrounds.bg1,
    pageHeaderBg: backgrounds.bg2,
    pageHeaderBorder: borders.border1,
    panelBorder: borders.border1,

    dropdownBg: form.formInputBg,
    dropdownShadow: basicColors.gray3,
    dropdownOptionHoverBg: backgrounds.bg2,

    // Text colors
    text: basicColors.gray1,
    textStrong: basicColors.dark2,
    textWeak: basicColors.gray2,
    textEmphasis: basicColors.dark5,
    textFaint: basicColors.dark4,
    textBlue: basicColors.blue85,

    // Link colors
    link: basicColors.gray1,
    linkDisabled: basicColors.gray3,
    linkHover: basicColors.dark1,
    linkExternal: basicColors.blueLight,
    headingColor: basicColors.gray1,

    ...form,
  },
};

export default lightTheme;
