import styled from 'styled-components';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 16px;
  margin: 0;
  box-shadow: 0 0.5rem 1rem rgba(31, 61, 135, 0.2);
`;

export default Card;
