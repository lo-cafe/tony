import styled from 'styled-components';

const Toggle = () => (
  <>
    <Label>
      {/* <input type="checkbox" checked={checked} onChange={onChange} /> */}
    </Label>
  </>
);

const Label = styled.label`
  display: flex;
  height: 20px;
  width: 40px;
  background: #fff;
  input {
    display: none;
  }
`;
