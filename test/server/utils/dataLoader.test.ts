import { headers } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';

import {
  loadDocumentProps,
  loadDocumentPropsCached,
  loadPreviewDocumentProps,
  loadSiteProps,
} from '../../../src/server';
import { DataLoaderOptions } from '../../../src/types';

describe('loadDocumentProps', () => {
  it('should throw an error if NEOS_BASE_URL is not set', async () => {
    await expect(loadDocumentProps({ slug: 'foo' })).rejects.toThrowError('Missing NEOS_BASE_URL environment variable');
  });

  describe('with NEOS_BASE_URL set', () => {
    beforeEach(() => {
      vi.stubEnv('NEOS_BASE_URL', 'http://neos:1234');
    });

    describe.each<{ opts?: DataLoaderOptions; expectedFetchConfig: RequestInit }>([
      // No options
      { expectedFetchConfig: { cache: 'no-store', headers: {}, next: undefined } },
      // Specify cache
      { opts: { cache: 'default' }, expectedFetchConfig: { cache: 'default', headers: {}, next: undefined } },
      // Specify cache and next tags
      {
        opts: { cache: 'force-cache', next: { tags: ['neos'] } },
        expectedFetchConfig: { cache: 'force-cache', headers: {}, next: { tags: ['neos'] } },
      },
    ])('with options $opts', ({ opts, expectedFetchConfig }) => {
      it('should fetch from configured API', async () => {
        const fetch = vi.fn().mockResolvedValue(createOkayFetchResponse({ meta: { title: 'Foo' } }));
        vi.stubGlobal('fetch', fetch);

        await expect(loadDocumentProps({ slug: 'foo' }, opts)).resolves.toStrictEqual({
          meta: { title: 'Foo' },
        });

        expect(fetch).toHaveBeenCalledWith(
          'http://neos:1234/neos/content-api/document?path=%2Ffoo',
          expectedFetchConfig
        );
      });
    });
  });

  describe('with optional option', () => {
    test('should not throw an error if NEOS_BASE_URL is not set', async () => {
      await expect(loadDocumentProps({ slug: 'foo' }, { optional: true })).resolves.toBeUndefined();
    });
  });
});

describe('loadDocumentPropsCached', () => {
  beforeEach(() => {
    vi.stubEnv('NEOS_BASE_URL', 'http://neos:1234');
  });

  test('should cache the result', async () => {
    const fetch = vi.fn().mockResolvedValue(createOkayFetchResponse({ meta: { title: 'Foo' } }));
    vi.stubGlobal('fetch', fetch);

    await expect(loadDocumentPropsCached('foo')).resolves.toStrictEqual({
      meta: { title: 'Foo' },
    });

    await expect(loadDocumentPropsCached('foo')).resolves.toStrictEqual({
      meta: { title: 'Foo' },
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('should cache the result again', async () => {
    const fetch = vi.fn().mockResolvedValue(createOkayFetchResponse({ meta: { title: 'Foo' } }));
    vi.stubGlobal('fetch', fetch);

    await expect(loadDocumentPropsCached('foo')).resolves.toStrictEqual({
      meta: { title: 'Foo' },
    });

    await expect(loadDocumentPropsCached('foo')).resolves.toStrictEqual({
      meta: { title: 'Foo' },
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('loadPreviewDocumentProps', () => {
  describe('with NEOS_BASE_URL set', () => {
    beforeEach(() => {
      vi.stubEnv('NEOS_BASE_URL', 'http://neos:1234');
    });

    // TODO Add test without context path query param
    // TODO Add test for PUBLIC_BASE_URL env and proxy headers

    describe('with Neos session cookie', () => {
      beforeEach(() => {
        vi.mocked(headers).mockReturnValue(new Headers({ Cookie: 'a-session-cookie' }));
      });

      describe.each<{ opts?: DataLoaderOptions }>([
        // No options
        {},
        // Override cache, should have no effect for preview
        { opts: { cache: 'default' } },
      ])('with options $opts', ({ opts }) => {
        it('should fetch from configured API', async () => {
          const fetch = vi.fn().mockResolvedValue(createOkayFetchResponse({ meta: { title: 'Foo Preview' } }));
          vi.stubGlobal('fetch', fetch);

          await expect(
            loadPreviewDocumentProps({ 'node[__contextNodePath]': 'foo/bar@user-me' }, opts)
          ).resolves.toStrictEqual({
            meta: { title: 'Foo Preview' },
          });

          expect(fetch).toHaveBeenCalledWith(
            'http://neos:1234/neos/content-api/document?contextPath=foo%2Fbar%40user-me',
            {
              cache: 'no-store',
              headers: {
                Cookie: 'a-session-cookie',
              },
              next: undefined,
            }
          );
        });
      });
    });
  });
});

describe('loadSiteProps', () => {
  it('should throw an error if NEOS_BASE_URL is not set', async () => {
    await expect(loadSiteProps()).rejects.toThrowError('Missing NEOS_BASE_URL environment variable');
  });

  describe('with NEOS_BASE_URL set', () => {
    beforeEach(() => {
      vi.stubEnv('NEOS_BASE_URL', 'http://neos:1234');
    });

    describe.each<{ opts?: DataLoaderOptions; expectedFetchConfig: RequestInit }>([
      // No options
      { expectedFetchConfig: { cache: 'no-store', headers: {}, next: undefined } },
      // Override cache
      { opts: { cache: 'default' }, expectedFetchConfig: { cache: 'default', headers: {}, next: undefined } },
    ])('with options $opts', ({ opts, expectedFetchConfig }) => {
      it('should fetch from configured API', async () => {
        const fetch = vi.fn().mockResolvedValue(createOkayFetchResponse({ meta: { title: 'Foo' } }));
        vi.stubGlobal('fetch', fetch);

        await expect(loadSiteProps(opts)).resolves.toStrictEqual({
          meta: { title: 'Foo' },
        });

        expect(fetch).toHaveBeenCalledWith('http://neos:1234/neos/content-api/site', expectedFetchConfig);
      });
    });
  });

  describe('with optional option', () => {
    test('should not throw an error if NEOS_BASE_URL is not set', async () => {
      await expect(loadSiteProps({ optional: true })).resolves.toBeUndefined();
    });
  });
});

// --- Mock implementations ---

let reactCached = false;

// Mock the `cache` export from React:
// 1. it is not exported in the _normal_ react version (using the canary channel would work though), but inside Next.js we can use it.
// 2. we don't want to use the real cache, because we can not control it in tests.
vi.mock('react', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react')>();
  return {
    ...mod,
    // The cache function is a bit tricky, since it is used at the module level when importing the module,
    // so we have to specify the implementation here and now - but still enable a reset of cached values in tests.
    // eslint-disable-next-line @typescript-eslint/ban-types
    cache: vi.fn(<CachedFunction extends Function>(fn: CachedFunction): CachedFunction => {
      // Cache the first call and return the cached value for all subsequent calls.
      let result: any;
      return ((...args: any[]) => {
        if (reactCached) {
          return result;
        }
        reactCached = true;
        return (result = fn(...args));
      }) as any;
    }),
  };
});

vi.mock('next/headers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('next/headers')>();
  return {
    ...mod,
    headers: vi.fn(),
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
  // Make sure React cache is reset after each test
  reactCached = false;
});

function createOkayFetchResponse(data: any) {
  return { ok: true, status: 200, json: () => new Promise((resolve) => resolve(data)) };
}
