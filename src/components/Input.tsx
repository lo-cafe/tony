import styled from 'styled-components';
import { lighten, darken } from 'polished';
import { InputHTMLAttributes } from 'react';
import getTextWidth from '~/utils/getTextWidth';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  limit?: number | string;
}

const Input: FC<InputProps> = ({ onChange, limit, value, ...rest }) => {
  const withinLimits = (value: string) => {
    if (!limit) return true;
    return typeof limit === 'number'
      ? value.length <= limit
      : getTextWidth(value, '400 14px Nunito') <= Number(limit.replace(/\D+/g, ''));
  };

  return (
    <InputWrapper>
      <InputItself
        withLimit={!!limit && typeof limit === 'number'}
        onChange={(e) =>
          onChange
            ? limit
              ? withinLimits(e.target.value)
                ? onChange(e)
                : undefined
              : onChange(e)
            : undefined
        }
        value={value}
        {...rest}
      />
      {!!limit && typeof limit === 'number' && (
        <Counter>
          {value ? String(value).length : 0}/{limit}
        </Counter>
      )}
    </InputWrapper>
  );
};

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const Counter = styled.div`
  position: absolute;
  right: 10px;
  top: 0;
  bottom: 0;
  margin: auto;
  font-size: 12px;
  height: 12px;
  line-height: 12px;
  opacity: 0.3;
`;

const InputItself = styled.input<{ withLimit: boolean }>`
  display: block;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: inherit;
  padding: 0 16px;
  padding-right: ${({ withLimit }) => (withLimit ? 40 : 0)}px;
  border: none;
  width: 100%;
  font-family: inherit;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background 0.2s ease-out,
    font-weight 0.2s ease-out;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  &:hover {
    background: ${({ theme }) => darken(0.01, theme.colors.inputBg)};
  }
  &:focus {
    font-weight: 700;
    outline: none;
    transform: translateY(-1px);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
    background: ${({ theme }) => lighten(0.1, theme.colors.inputBg)};
  }
`;

export default Input;
