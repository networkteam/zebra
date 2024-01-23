import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { loadDocumentProps } from '../../../src/server';

describe('loadDocumentProps', () => {
  describe('without options', () => {
    test('should throw an error if NEOS_BASE_URL is not set', async () => {
      await expect(loadDocumentProps({ slug: 'foo' })).rejects.toThrowError(
        'Missing NEOS_BASE_URL environment variable'
      );
    });

    describe('with NEOS_BASE_URL set', () => {
      beforeEach(() => {
        vi.stubEnv('NEOS_BASE_URL', 'http://neos:1234');
      });

      test('should fetch from configured API', async () => {
        const fetch = vi.fn().mockResolvedValue(createOkayFetchResponse({ meta: { title: 'Foo' } }));
        vi.stubGlobal('fetch', fetch);

        await expect(loadDocumentProps({ slug: 'foo' })).resolves.toStrictEqual({
          meta: { title: 'Foo' },
        });

        expect(fetch).toHaveBeenCalledWith('http://neos:1234/neos/content-api/document?path=%2Ffoo', {
          cache: 'no-store',
          headers: {},
          next: undefined,
        });
      });
    });
  });

  describe('with optional option', () => {
    test('should not throw an error if NEOS_BASE_URL is not set', async () => {
      await expect(loadDocumentProps({ slug: 'foo' }, { optional: true })).resolves.toBeUndefined();
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
});

function createOkayFetchResponse(data: any) {
  return { ok: true, status: 200, json: () => new Promise((resolve) => resolve(data)) };
}
