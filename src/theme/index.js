/**
 * Theme index - Export tất cả các theme components
 */

import colors from './colors';
import typography from './typography';
import spacing from './spacing';

export { colors, typography, spacing };

const theme = {
  colors,
  typography,
  spacing,
  
  // Theme modes
  mode: {
    light: {
      background: colors.background.light,
      text: colors.text.primary.light,
      textSecondary: colors.text.secondary.light,
      border: colors.border.light,
    },
    dark: {
      background: colors.background.dark,
      text: colors.text.primary.dark,
      textSecondary: colors.text.secondary.dark,
      border: colors.border.dark,
    },
  },
};

export default theme; 