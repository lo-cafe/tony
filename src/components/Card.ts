import styled from 'styled-components';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.blurBg};
  margin: 0;
  border-radius: 16px;
  box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.15);
  border: solid 1px ${({ theme }) => theme.colors.blurBorderColor};
  backdrop-filter: blur(40px);
`;

export default Card;
