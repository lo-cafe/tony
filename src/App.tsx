import { useEffect, useState } from 'react';
// import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { ReactFlowProvider } from 'react-flow-renderer';
import { getAuth } from 'firebase/auth';

import colors from '~/constants/colors';
import { initFirebase } from '~/instances/firebase';
import useUserStore from '~/instances/userStore';
import Story from '~/pages/Story';

initFirebase();
const auth = getAuth();

const App = () => {
  const setEmail = useUserStore((state) => state.setEmail);
  const setUid = useUserStore((state) => state.setUid);
  const _theme = useUserStore((state) => state.theme);
  const nodeColors = useUserStore((state) => state.nodeColors);
  const [prefersDark, setPrefersDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  const resetPrefersDark = (e: any) => {
    setPrefersDark(e.matches ? 'dark' : 'light');
  };

  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', resetPrefersDark);
    auth.onAuthStateChanged((user) => {
      setEmail(user?.email || '');
      setUid(user?.uid || '');
    });
    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', resetPrefersDark);
    };
  }, []);

  const theme = (_theme === 'auto' ? prefersDark : _theme) as 'light' | 'dark';
  return (
    <ThemeProvider theme={{ colors: colors[theme], nodeColors: nodeColors[theme] }}>
      <ReactFlowProvider>
        <GlobalStyles />
        <Story />
      </ReactFlowProvider>
    </ThemeProvider>
  );
};
export default App;

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.colors.font};
    font-family: 'Nunito', -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  *, *::after, *::before {
    box-sizing: border-box;
  }
  .react-flow__attribution {
    display: none !important;
  }
`;
