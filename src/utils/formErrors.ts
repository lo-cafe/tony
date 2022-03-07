const formErrorsObj = {
  required: (name: string) => `${name} é obrigatório(a)`,
  pattern: (name: string) => `${name} não é válido(a)`,
};

export type FormErrorsType = keyof typeof formErrorsObj;

const formErrors = (error: FormErrorsType | any, name: string) =>
  typeof formErrorsObj[String(error) as FormErrorsType] === 'undefined'
    ? undefined
    : formErrorsObj[String(error) as FormErrorsType](name);

export default formErrors;
