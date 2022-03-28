import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { createPortal } from 'react-dom';
import {
  getAuth,
  signOut,
  setPersistence,
  createUserWithEmailAndPassword,
  browserSessionPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Transition } from 'react-transition-group';
import { FiUser } from 'react-icons/fi';
import { InfinitySpin } from 'react-loader-spinner';
import { initFirebase } from '~/instances/firebase';
import useUserStore from '~/instances/userStore';

import CloseArea from '~/components/CloseArea';
import Button from '~/components/Button';
import FixedButton from '~/components/FixedButton';
import Card from '~/components/Card';

initFirebase();
const auth = getAuth();
setPersistence(auth, browserSessionPersistence);

const LoginWidget = () => {
  const loggedUserEmail = useUserStore((s) => s.email);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [email, setEmail] = useState('igormarcossi@hey.com');
  const [password, setPassword] = useState('guigo001');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpInstead, setSignUpInstead] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (signUpInstead) {
        await createUserWithEmailAndPassword(auth, email, password);
        setEmail('');
        setPassword('');
        setName('');
        setSignUpInstead(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setWidgetOpen(false);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const preventDefault = (func: () => void) => (e: React.FormEvent) => {
    setError('');
    e.preventDefault();
    func();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'name') setName(value);
  };

  const logout = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    signOut(auth);
    setWidgetOpen(false);
  };

  return (
    <>
      {createPortal(
        <>
          <Transition in={widgetOpen} timeout={200} unmountOnExit mountOnEnter>
            {() => <CloseArea onClick={() => setWidgetOpen(false)} />}
          </Transition>
          <Transition
            in={widgetOpen}
            timeout={{
              enter: 1,
              exit: 200,
            }}
            unmountOnExit
            mountOnEnter
          >
            {(state: string) => (
              <StyledCard loading={loading} onSubmit={submit} as="form" state={state}>
                {!!loggedUserEmail ? (
                  <Button onClick={logout}>Logout</Button>
                ) : (
                  <>
                    <LoaderWrapper active={loading}>
                      <InfinitySpin width="200" color="#0068f6" />
                    </LoaderWrapper>
                    <TitlesWrapper signUpInstead={signUpInstead}>
                      <button onClick={preventDefault(() => setSignUpInstead(false))}>Login</button>
                      <button onClick={preventDefault(() => setSignUpInstead(true))}>
                        Sign Up
                      </button>
                    </TitlesWrapper>
                    {signUpInstead && (
                      <StyledInput
                        required
                        value={name}
                        name="name"
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Name"
                      />
                    )}
                    <StyledInput
                      required
                      value={email}
                      name="email"
                      onChange={handleInputChange}
                      type="email"
                      placeholder="Email"
                    />
                    <StyledInput
                      required
                      value={password}
                      name="password"
                      onChange={handleInputChange}
                      type="password"
                      placeholder="••••••"
                    />
                    <Button type="submit">{signUpInstead ? 'Signup' : 'Login'}</Button>
                    {!!error && <Error>{error}</Error>}
                  </>
                )}
              </StyledCard>
            )}
          </Transition>
        </>,
        document.body
      )}
      <FixedButton
        as="div"
        rightIcon={<FiUser />}
        value={loggedUserEmail || 'Login'}
        onClick={() => setWidgetOpen(true)}
        color="add"
      />
    </>
  );
};

export default LoginWidget;

const Error = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

const LoaderWrapper = styled.div<{ active: boolean }>`
  position: absolute;
  top: -1px;
  left: -1px;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  border-radius: 16px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(${({ active }) => (active ? 20 : 0)}px);
  background-color: rgba(255, 255, 255, 0.5);
  opacity: ${({ active }) => (active ? 1 : 0)};
  pointer-events: ${({ active }) => (active ? 'auto' : 'none')};
  transition: opacity 300ms ease-out, backdrop-filter 300ms ease-out;
`;

const TitlesWrapper = styled.div<{ signUpInstead: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: bottom;
  button {
    margin: 0;
    margin-bottom: 16px;
    font-size: 20px;
    cursor: pointer;
    border: none;
    background: transparent;
    font-family: inherit;
    font-weight: 700;
    transition: color 200ms ease-out;
  }
  button:first-child {
    color: ${({ signUpInstead }) => (signUpInstead ? '#eee' : '#0068f6')};
    &:hover {
      color: ${({ signUpInstead }) => (signUpInstead ? '#dbdbdb' : '#0068f6')};
    }
  }
  button:last-child {
    color: ${({ signUpInstead }) => (signUpInstead ? '#0068f6' : '#eee')};
    &:hover {
      color: ${({ signUpInstead }) => (signUpInstead ? '#0068f6' : '#dbdbdb')};
    }
  }
`;

const StyledCard = styled(Card)<{ state: string; loading: boolean }>`
  position: fixed;
  top: 72px;
  width: 300px;
  right: 16px;
  z-index: 9999999;
  padding: 18px;
  padding-top: 14px;
  ${({ loading }) =>
    loading &&
    css`
      backdrop-filter: none;
    `};
  opacity: ${({ state }) => (state === 'entering' ? 0 : state === 'entered' ? 1 : 0)};
  transform: translateY(
    ${({ state }) => (state === 'entering' ? -25 : state === 'entered' ? 0 : -25)}px
  );
  /* opacity: ${({ state }) => (state === 'entering' || state === 'entered' ? 1 : 0)}; */
  filter: ${({ state, loading }) =>
    loading
      ? 'none'
      : state === 'entering'
      ? 'blur(50px)'
      : state === 'entered'
      ? 'blur(0px)'
      : 'blur(50px)'};
  transition: opacity
      ${({ state }) => (state === 'entering' || state === 'entered' ? '0.05s' : '0.2s')} ease-out,
    filter 0.2s ease, transform 0.2s ease;
`;

const StyledInput = styled.input`
  display: block;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  background: #fafafa;
  padding: 0 16px;
  margin-bottom: 16px;
  border: none;
  width: 100%;
  font-family: inherit;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background 0.2s ease-out;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  &:focus {
    font-weight: 700;
    color: #0068f6;
    outline: none;
    transform: translateY(-1px);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
    background: white;
  }
`;


