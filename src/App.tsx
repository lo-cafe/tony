import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import theme from '~/constants/theme';

import Login from '~/pages/auth/Login';
import Signup from '~/pages/auth/Signup';

const App = () => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <GlobalStyles />
      <Routes>
        <Route path="/">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="login" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;

const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colors.bg};
    margin: 0;
    padding: 0;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  * {
    box-sizing: border-box;
  }
`;
