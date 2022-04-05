import { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { createPortal } from 'react-dom';
import { Transition } from 'react-transition-group';
import { FiSettings, FiEye } from 'react-icons/fi';
import { getLuminance } from 'polished';

import useUserStore, { NodeColors, initialDark, initialLight } from '~/instances/userStore';

import lightButton from '~/assets/lightButton.png';
import darkButton from '~/assets/darkButton.png';
import autoButton from '~/assets/autoButton.png';
import CloseArea from '~/components/CloseArea';
import Button from '~/components/Button';
import Picker from '~/components/Picker';
import FixedButton from '~/components/FixedButton';
import Card from '~/components/Card';

import Appearence from './components/Appearence';

const tabs = [
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
                    <Tab onClick={() => setActiveTabIndex(i)} active={activeTabIndex === i} key={tab.label}>
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
`;

const TabsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
  width: 150px;
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
  background: ${({ theme, active }) =>
    active
      ? getLuminance(theme.colors.blurBg) > 0.3
        ? 'rgba(0,0,0,0.1)'
        : 'rgba(255,255,255,0.1)'
      : 'transparent'};
`;
