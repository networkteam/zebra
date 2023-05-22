import log from 'loglevel';
import { GetServerSidePropsContext, GetStaticPathsContext, GetStaticPropsContext, NextConfig } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import parse from 'html-react-parser';

import { ApiErrors, BackendProps, DocumentsResponse, NeosContentNode, NeosData } from '../types';

log.setDefaultLevel(log.levels.DEBUG);

export const loadStaticPaths = async ({ locales, defaultLocale }: GetStaticPathsContext) => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  const startTime = Date.now();
  const fetchUrl = apiUrl + '/neos/content-api/documents';
  const response = await fetch(fetchUrl, {
    headers: buildNeosHeaders(),
  });

  if (!response.ok) {
    const data: ApiErrors = await response.json();
    if (data.errors) {
      const flatErrors = data.errors.map((e) => e.message).join(', ');
      log.error('error fetching from content API with url', fetchUrl, ':', flatErrors);
      throw new Error('Content API responded with error: ' + flatErrors);
    }
  }

  const data: DocumentsResponse = await response.json();
  const endTime = Date.now();
  log.debug('fetched documents from content API, took', `${endTime - startTime}ms`);

  const nonDefaultLocales = locales?.filter((locale) => locale !== defaultLocale) ?? [];
  const paths = data.documents.map((document) => {
    if (document.routePath === '/') {
      return { params: { slug: [''] } };
    }

    const { slug, locale } = (() => {
      const s = routePathToSlug(document.routePath);

      if (nonDefaultLocales.includes(s[0])) {
        return {
          slug: s.slice(1).length > 0 ? s.slice(1) : [''],
          locale: s[0],
        };
      }

      return {
        slug: s,
        locale: defaultLocale,
      };
    })();

    return { params: { slug, document }, locale };
  });

  return paths;
};

export const loadStaticProps = async ({ params, locale, defaultLocale }: GetStaticPropsContext) => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  if (!params) {
    return undefined;
  }

  const localePrefix = locale && locale !== defaultLocale ? locale + '/' : '';
  const path = '/' + localePrefix + (params?.slug && Array.isArray(params.slug) ? params.slug.join('/') : '');

  const startTime = Date.now();
  const fetchUrl = apiUrl + '/neos/content-api/document?path=' + encodeURIComponent(path);
  const response = await fetch(fetchUrl, {
    headers: buildNeosHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      log.debug('content API returned 404 for path', path);

      return undefined;
    }

    const data: ApiErrors = await response.json();
    if (data.errors) {
      const flatErrors = data.errors.map((e) => e.message).join(', ');
      log.error('error fetching from content API with url', fetchUrl, ':', flatErrors);
      throw new Error('Content API responded with error: ' + flatErrors);
    }
  }

  const data: NeosData = await response.json();
  const endTime = Date.now();
  log.debug('fetched data from content API for path', path, ', took', `${endTime - startTime}ms`);

  return data;
};

export const loadServerSideDocumentProps = async ({ query, req }: GetServerSidePropsContext) => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  const contextPath = query['node[__contextNodePath]'];
  if (typeof contextPath !== 'string') {
    throw new Error('Missing context path query parameter');
  }

  const startTime = Date.now();
  const fetchUrl = apiUrl + '/neos/content-api/document?contextPath=' + encodeURIComponent(contextPath);
  const response = await fetch(fetchUrl, {
    headers: buildNeosPreviewHeaders(req),
  });

  if (!response.ok) {
    if (response.status === 404) {
      log.debug('content API returned 404 for context path', contextPath);

      return {
        notFound: true,
      };
    }

    const data: ApiErrors = await response.json();
    if (data.errors) {
      const flatErrors = data.errors.map((e) => e.message).join(', ');
      log.error('error fetching from content API with url', fetchUrl, ':', flatErrors);
      throw new Error('Content API responded with error: ' + flatErrors);
    }
  }

  const data: NeosData = await response.json();
  const endTime = Date.now();
  log.debug('fetched data from content API for context path', contextPath, ', took', `${endTime - startTime}ms`);

  return data;
};

export const loadServerSideNodeProps = async ({ query, req }: GetServerSidePropsContext) => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  const contextPath = query['node[__contextNodePath]'];
  if (typeof contextPath !== 'string') {
    throw new Error('Missing context path query parameter');
  }

  const startTime = Date.now();
  const fetchUrl = apiUrl + '/neos/content-api/node?contextPath=' + encodeURIComponent(contextPath);
  const response = await fetch(fetchUrl, {
    headers: buildNeosPreviewHeaders(req),
  });

  if (!response.ok) {
    const data: ApiErrors = await response.json();
    if (data.errors) {
      const flatErrors = data.errors.map((e) => e.message).join(', ');
      log.error('error fetching from content API with url', fetchUrl, ':', flatErrors);
      throw new Error('Content API responded with error: ' + flatErrors);
    }
  }

  const data: NeosData = await response.json();
  const endTime = Date.now();
  log.debug('fetched data from content API for context path', contextPath, ', took', `${endTime - startTime}ms`);

  return data;
};

export const routePathToSlug = (routePath: string): string[] => {
  if (routePath.startsWith('/')) {
    routePath = routePath.substring(1);
  }
  return routePath.split('/');
};

// Sets expected metadata for the Neos UI and dispatches the Neos.Neos.Ui.ContentReady event
export const injectNeosBackendMetadata = (backend: BackendProps | undefined) => {
  (window as any)['@Neos.Neos.Ui:DocumentInformation'] = backend?.documentInformation;

  const event = new CustomEvent('Neos.Neos.Ui.ContentReady');
  window.parent.document.dispatchEvent(event);

  // TODO Check if we can do it differently
  document.body.classList.add('neos-backend');
};

// Hook to notify the iframe host about route changes (with fake unload / load events)
export const useNotifyContentCanvasRouteChanges = () => {
  const router = useRouter();

  const onRouteChangeStart = () => {
    // Dispatch an unload event for the ContentCanvas to start the loading animation
    const event = new CustomEvent('unload');
    window.dispatchEvent(event);

    // Workaround: we need to reset the initialized state of the document for a correct reset (e.g. focused element) and loading to stop
    if ('__isInitialized' in document) {
      delete document.__isInitialized;
    }
  };
  const onRouteChangeEnd = () => {
    // Fire event for iframe host about load and pass reference to iframe as target
    const event = new CustomEvent<{ target: { contentWindow: Window } }>('load', {
      detail: { target: { contentWindow: window } },
    });
    window.dispatchEvent(event);
  };
  useEffect(() => {
    router.events.on('routeChangeStart', onRouteChangeStart);
    router.events.on('routeChangeComplete', onRouteChangeEnd);
    router.events.on('routeChangeError', onRouteChangeEnd);

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
      router.events.off('routeChangeComplete', onRouteChangeEnd);
      router.events.off('routeChangeError', onRouteChangeEnd);
    };
  }, [router]);
}

export const guestFrameIncludes = (backend: BackendProps | undefined) => {
  if (backend?.guestFrameApplication) {
    return parse(backend.guestFrameApplication);
  }

  return null;
}

export const withZebra = (nextConfig: NextConfig): NextConfig => {
  return {
    ...nextConfig,
    rewrites: async () => {
      const neosRewrites = [
        {
          source: '/neos/:path*',
          destination: process.env.NEOS_BASE_URL + '/neos/:path*',
        },
        {
          source: '/media/thumbnail/:path*',
          destination: process.env.NEOS_BASE_URL + '/media/thumbnail/:path*',
        },
        {
          source: '/_Resources/:path*',
          destination: process.env.NEOS_BASE_URL + '/_Resources/:path*',
        },
      ];

      const rewrites = await nextConfig.rewrites?.();

      if (!rewrites) {
        return neosRewrites;
      }
      if (Array.isArray(rewrites)) {
        return rewrites.concat(neosRewrites);
      }

      rewrites.afterFiles = rewrites.afterFiles.concat(neosRewrites);
      return rewrites;
    },
  };
};

export const buildNeosPreviewHeaders = (req: GetServerSidePropsContext['req']) => {
  const headers: HeadersInit = {
    // Pass the cookie to content API to forward the Neos session
    Cookie: req.headers.cookie ?? '',
  };

  // If PUBLIC_BASE_URL is set, we set the X-Forwarded-* headers from it
  if (process.env.PUBLIC_BASE_URL) {
    applyProxyHeaders(headers, process.env.PUBLIC_BASE_URL);
  } else {
    // Set forwarded host and port to make sure URIs in metadata are correct for the Neos UI
    if (req.headers.host) {
      // Split host and port from header
      const [host, port] = req.headers.host.split(':');
      headers['X-Forwarded-Host'] = host;
      if (port) {
        headers['X-Forwarded-Port'] = port;
      } else {
        // Check if HTTPS or HTTP request and set default port to make sure Neos does not use port of an internal endpoint
        headers['X-Forwarded-Port'] = req.headers['x-forwarded-proto'] === 'https' ? '443' : '80';
        headers['X-Forwarded-Proto'] =
          typeof req.headers['x-forwarded-proto'] === 'string' ? req.headers['x-forwarded-proto'] : 'http';
      }
    }
  }
  return headers;
};

export const buildNeosHeaders = () => {
  const headers: Record<string, string> = {};

  // If PUBLIC_BASE_URL is set, we set the X-Forwarded-* headers from it
  if (process.env.PUBLIC_BASE_URL) {
    applyProxyHeaders(headers, process.env.PUBLIC_BASE_URL);
  }

  return headers;
};

const applyProxyHeaders = (headers: Record<string, string>, baseUrl: string) => {
  const publicBaseUrl = new URL(baseUrl);
  headers['X-Forwarded-Host'] = publicBaseUrl.hostname;
  if (publicBaseUrl.port) {
    headers['X-Forwarded-Port'] = publicBaseUrl.port;
  } else {
    // Check if HTTPS or HTTP request and set default port to make sure Neos does not use port of an internal endpoint
    headers['X-Forwarded-Port'] = publicBaseUrl.protocol === 'https:' ? '443' : '80';
  }
  headers['X-Forwarded-Proto'] = publicBaseUrl.protocol === 'https:' ? 'https' : 'http';
};
