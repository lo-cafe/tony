import { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

import Text from '~/components/Text';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: FC<InputProps> = ({ label, ...rest }) => {
  return (
    <Wrapper>
      <Text as="label">{label}</Text>
      <InputElement {...rest} />
    </Wrapper>
  );
};

export default Input;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const InputElement = styled.input`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 16px;
  font-size: 24px;
  width: 100%;
  line-height: 54px;
  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
  /* height: 56px; */
`;
