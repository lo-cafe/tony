import { useEffect } from 'react';
// import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { ReactFlowProvider } from 'react-flow-renderer';
import { getAuth } from 'firebase/auth';

import { initFirebase } from '~/instances/firebase';
import userStore from '~/instances/userStore';
import Story from '~/pages/Story';

initFirebase();
const auth = getAuth();

const App = () => {
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      userStore.update((s) => {
        s.email = user?.email || '';
        s.uid = user?.uid || '';
      });
    });
  }, []);
  return (
    <ReactFlowProvider>
      <GlobalStyles />
      <Story />
    </ReactFlowProvider>
  );
};
export default App;

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Nunito', -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  *, *::after, *::before {
    box-sizing: border-box;
  }
  .react-flow__attribution {
    display: none !important;
  }
`;
