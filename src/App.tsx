/**
 * NLQWellness App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, SafeAreaView } from 'react-native';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

// Component chính của ứng dụng có sử dụng theme
const Main = () => {
  const { theme, themeMode } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <AppNavigator />
    </SafeAreaView>
  );
};

// Root component bao bọc bởi ThemeProvider và Redux Provider
function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <Main />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App; 