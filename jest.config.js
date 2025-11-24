export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/tests/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/.*\\.entity\\.ts$'
  ],
  modulePathIgnorePatterns: [
    '/dist/'
  ],
  collectCoverageFrom: [
    'src/**/*.ts', 
    '!src/**/*.entity.ts',
    '!dist/**',
    '!src/shared/db/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
