/* eslint-disable */
export default {
  displayName: 'capacity-react',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { 
      tsconfig: 'libs/capacity-react/tsconfig.spec.json',
    }],
  },
  moduleNameMapper: {
    '^@capacity/core$': '<rootDir>/../../libs/capacity-core/src',
    '^@capacity/core/(.*)$': '<rootDir>/../../libs/capacity-core/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/capacity-react',
};