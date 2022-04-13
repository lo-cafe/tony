import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useDebouncyEffect } from 'use-debouncy';
import { lighten } from 'polished';

import CloseArea from '~/components/CloseArea';

interface PickerProps {
  color: string;
  onChange: (newColor: string) => void;
}

const Picker: FC<PickerProps> = ({ color, onChange }) => {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [internalColor, setInternalColor] = useState(color);

  useDebouncyEffect(() => onChange(internalColor), 200, [internalColor]);

  return (
    <Wrapper>
      <Color
        selected={widgetOpen}
        onClick={() => setWidgetOpen(true)}
        style={{ background: color }}
      />
      {widgetOpen && (
        <>
          <CloseArea onClick={() => setWidgetOpen(false)} />
          <ColorPickerWrapper>
            <HexColorPicker color={color} onChange={setInternalColor} />
            <StyledHexColorInput color={color} onChange={setInternalColor} />
          </ColorPickerWrapper>
        </>
      )}
    </Wrapper>
  );
};

export default Picker;

const Wrapper = styled.div`
  position: relative;
`;

const Color = styled.button<{ selected: boolean }>`
  height: 30px;
  width: 80px;
  border-radius: 8px;
  cursor: pointer;
  border: ${({ selected, theme }) =>
    selected ? '4px solid rgba(255,255,255,0.5)' : '0px solid rgba(255,255,255,0.5)'};
  transition: border ${({ theme }) => theme.transitions.quick}ms ease-out;
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 21;
`;

const StyledHexColorInput = styled(HexColorInput)`
  display: block;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: inherit;
  padding: 0 16px;
  border: none;
  font-family: inherit;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background 0.2s ease-out;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  width: 80px;
  margin: 8px auto 0;
  text-align: center;
  color
  &:focus {
    font-weight: 700;
    color: ${({ theme }) => theme.nodeColors.accent};
    outline: none;
    transform: translateY(-1px);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
    background: ${({ theme }) => lighten(0.1, theme.colors.inputBg)};
  }
`;
