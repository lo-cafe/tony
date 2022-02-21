import styled from 'styled-components';
import { useForm } from 'react-hook-form';

import Text from '~/components/Text';
import Input from '~/components/Input';
import Card from '~/components/Card';

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <Wrapper>
      <Card as="form" onSubmit={handleSubmit(onSubmit)}>
        <Text align="center" size="big" color="magicAccent" weight={600}>
          Entrar
        </Text>
        <Input
          label="Email"
          placeholder="email@exemplo.com"
          {...register('email', { required: true })}
        />
        <Input
          label="Senha"
          placeholder="••••••••"
          type="password"
          {...register('password', { required: true })}
        />
      </Card>
    </Wrapper>
  );
};

export default Login;

const Wrapper = styled.div`
  height: 100vh;
  padding: 20vw;
  display: flex;
`;
