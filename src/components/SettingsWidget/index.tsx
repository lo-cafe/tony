import { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { createPortal } from 'react-dom';
import { Transition } from 'react-transition-group';
import { FiSettings, FiEye, FiBox } from 'react-icons/fi';
import { getLuminance } from 'polished';

import CloseArea from '~/components/CloseArea';
import FixedButton from '~/components/FixedButton';
import Card from '~/components/Card';

import Appearence from './components/tabs/Appearence';
import General from './components/tabs/General';

const tabs = [
  {
    label: 'General',
    component: <General />,
    icon: <FiBox />,
  },
  {
    label: 'Appearence',
    component: <Appearence />,
    icon: <FiEye />,
  },
];

const LoginWidget = () => {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

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
              <StyledCard state={state}>
                <TabsList>
                  {tabs.map((tab, i) => (
                    <Tab
                      onClick={() => setActiveTabIndex(i)}
                      active={activeTabIndex === i}
                      key={tab.label}
                    >
                      {tab.icon}
                      {tab.label}
                    </Tab>
                  ))}
                </TabsList>
                {tabs[activeTabIndex].component}
              </StyledCard>
            )}
          </Transition>
        </>,
        document.body
      )}
      <FixedButton
        as="div"
        rightIcon={<FiSettings />}
        value="Settings"
        onClick={() => setWidgetOpen(true)}
      />
    </>
  );
};

export default LoginWidget;

const StyledCard = styled(Card)<{ state: string }>`
  position: fixed;
  top: 72px;
  right: 16px;
  width: 550px;
  height: 400px;
  z-index: 20;
  padding: 14px;
  opacity: ${({ state }) => (state === 'entering' ? 0 : state === 'entered' ? 1 : 0)};
  transform: translateY(
    ${({ state }) => (state === 'entering' ? -25 : state === 'entered' ? 0 : -25)}px
  );
  /* opacity: ${({ state }) => (state === 'entering' || state === 'entered' ? 1 : 0)}; */
  filter: ${({ state }) =>
    state === 'entering' ? 'blur(50px)' : state === 'entered' ? 'blur(0px)' : 'blur(50px)'};
  transition: opacity
      ${({ state }) => (state === 'entering' || state === 'entered' ? '0.05s' : '0.2s')} ease-out,
    filter 0.2s ease, transform 0.2s ease;
  display: flex;
  gap: 16px;
  & > * {
    flex: 1;
  }
`;

const TabsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
  margin: 0;
  flex-basis: 150px;
  flex-grow: 0;
  flex-shrink: 0;
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 14px;
  border-radius: 8px;
  gap: 8px;
  border: none;
  width: 100%;
  color: ${({ theme }) => theme.colors.font};
  font-weight: 600;
  cursor: pointer;
  transition: background-color ${({theme}) => theme.transitions.quick}ms ease;
  background: ${({ theme, active }) =>
    active
      ? getLuminance(theme.colors.blurBg) > 0.3
        ? 'rgba(0,0,0,0.1)'
        : 'rgba(255,255,255,0.1)'
      : 'transparent'};
  &:hover {
    background: ${({ theme, active }) =>
      active
        ? getLuminance(theme.colors.blurBg) > 0.3
          ? 'rgba(0,0,0,0.1)'
          : 'rgba(255,255,255,0.1)'
        : getLuminance(theme.colors.blurBg) > 0.3
        ? 'rgba(0,0,0,0.05)'
        : 'rgba(255,255,255,0.05)'};
  }
`;
