import { useState, useEffect } from 'react';
import styled from 'styled-components';

import useUserStore, { NodeColors, initialDark, initialLight } from '~/instances/userStore';

import lightButton from '~/assets/lightButton.png';
import darkButton from '~/assets/darkButton.png';
import autoButton from '~/assets/autoButton.png';
import Button from '~/components/Button';
import Picker from '~/components/Picker';

const Appearence = () => {
  const themeType = useUserStore((s) => s.theme);
  const nodeColors = useUserStore((s) => s.nodeColors);
  const setDarkColors = useUserStore((s) => s.setDarkColors);
  const _setLightColors = useUserStore((s) => s.setLightColors);
  const setThemeType = useUserStore((s) => s.setTheme);
  const [mirrorColors, setMirrorColors] = useState(false);

  const setLightColors = (colors: Partial<NodeColors>) => {
    if (mirrorColors) setDarkColors(colors);
    _setLightColors(colors);
  };

  const resetColors = () => {
    if (!window.confirm('Are you sure you want to reset colors?')) return;
    setLightColors(initialLight);
    setDarkColors(initialDark);
    setMirrorColors(false);
  };

  useEffect(() => {
    if (mirrorColors) setDarkColors(nodeColors.light);
  }, [mirrorColors, setDarkColors]);

  return (
    <div>
      <Title style={{ marginTop: 0 }}>Theme</Title>
      <ColorsWrapper>
        <ThemeChooserImg
          active={themeType === 'auto'}
          onClick={() => setThemeType('auto')}
          src={autoButton}
          alt="light"
        />
        <ThemeChooserImg
          active={themeType === 'dark'}
          onClick={() => setThemeType('dark')}
          src={darkButton}
          alt="light"
        />
        <ThemeChooserImg
          active={themeType === 'light'}
          onClick={() => setThemeType('light')}
          src={lightButton}
          alt="light"
        />
      </ColorsWrapper>
      <Title>{mirrorColors ? 'Colors' : 'Light colors'}</Title>
      <label>
        Mirror colors
        <input
          checked={mirrorColors}
          onChange={(e) => setMirrorColors(e.target.checked)}
          type="checkbox"
        />
      </label>
      <ColorsWrapper>
        <div>
          Accent
          <Picker
            color={nodeColors.light.accent}
            onChange={(newColor) => setLightColors({ accent: newColor })}
          />
        </div>

        <div>
          Text node
          <Picker
            color={nodeColors.light.textNode}
            onChange={(newColor) => setLightColors({ textNode: newColor })}
          />
        </div>
        <div>
          Answer node
          <Picker
            color={nodeColors.light.answerNode}
            onChange={(newColor) => setLightColors({ answerNode: newColor })}
          />
        </div>
        <div>
          Condition node
          <Picker
            color={nodeColors.light.conditionNode}
            onChange={(newColor) => setLightColors({ conditionNode: newColor })}
          />
        </div>
      </ColorsWrapper>
      {!mirrorColors && (
        <>
          <Title>Dark colors</Title>
          <ColorsWrapper>
            <div>
              Accent color
              <Picker
                color={nodeColors.dark.accent}
                onChange={(newColor) => setDarkColors({ accent: newColor })}
              />
            </div>
            <div>
              Text node
              <Picker
                color={nodeColors.dark.textNode}
                onChange={(newColor) => setDarkColors({ textNode: newColor })}
              />
            </div>
            <div>
              Answer node
              <Picker
                color={nodeColors.dark.answerNode}
                onChange={(newColor) => setDarkColors({ answerNode: newColor })}
              />
            </div>
            <div>
              Condition node
              <Picker
                color={nodeColors.dark.conditionNode}
                onChange={(newColor) => setDarkColors({ conditionNode: newColor })}
              />
            </div>
          </ColorsWrapper>
        </>
      )}
      <StyledButton red onClick={resetColors}>
        Reset
      </StyledButton>
    </div>
  );
};

export default Appearence;

const StyledButton = styled(Button)`
  margin-top: 16px;
`;

const Title = styled.div`
  margin: 0;
  margin-top: 16px;
  font-size: 20px;
  margin-bottom: 8px;
  font-family: inherit;
  font-weight: 700;
`;

const ColorsWrapper = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
`;

const ThemeChooserImg = styled.img<{ active: boolean }>`
  height: 60px;
  opacity: ${({ active }) => (active ? 1 : 0.25)};
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.35));
  cursor: pointer;
  transition: opacity 0.2s ease-out;
  &:hover {
    opacity: 0.75;
  }
`;
