import type { Config } from '@jest/types';
const { pathsToModuleNameMapper } = require('ts-jest');

const { compilerOptions } = require('./tsconfig.json');

// Or async function
export default async (): Promise<Config.InitialOptions> => {
  return {
    verbose: true,
    preset: 'jest-puppeteer',
    transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    rootDir: '.',
    roots: ['./src'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    resetMocks: false,
    setupFiles: ['jest-localstorage-mock'],
  };
};
