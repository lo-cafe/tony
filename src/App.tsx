import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { ReactFlowProvider } from 'react-flow-renderer';

import Story from '~/pages/Story';

const App = () => (
  <ReactFlowProvider>
    <GlobalStyles />
    <Story />
  </ReactFlowProvider>
);

export default App;

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  *, *::after, *::before {
    box-sizing: border-box;
  }
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
`;
