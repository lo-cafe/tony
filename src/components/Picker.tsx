import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useDebouncyEffect } from 'use-debouncy';

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
            <HexColorInput color={color} onChange={setInternalColor} />
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
  border: ${({ selected, theme }) => (selected ? '4px solid rgba(255,255,255,0.5)' : '0px solid rgba(255,255,255,0.5)')};
  transition: border 200ms ease-out;
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 21;
`;
