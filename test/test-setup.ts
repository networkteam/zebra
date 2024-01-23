import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

beforeAll(() => {});

afterAll(() => {});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
