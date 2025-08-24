import { jest,beforeAll,afterAll } from '@jest/globals';

beforeAll(() => {
  // Global setup before all tests
  jest.useFakeTimers();
});

afterAll(() => {
  // Global cleanup after all tests
  jest.useRealTimers();
});
