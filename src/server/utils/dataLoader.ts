import log from 'loglevel';
import { headers as nextHeaders } from 'next/headers';
import { cache } from 'react';

import { ApiErrors, NeosData, SiteData } from '../../types';

log.setDefaultLevel(log.levels.DEBUG);

// TODO Add explicit cache configuration for cached / uncached
export const loadDocumentProps = async (params: { slug: string | string[] }) => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  const { slug } = params;

  if (typeof slug !== 'string' && !Array.isArray(slug)) {
    throw new Error('Missing slug param');
  }

  const path = '/' + (slug && Array.isArray(slug) ? slug.join('/') : slug);

  const startTime = Date.now();
  const fetchUrl = apiUrl + '/neos/content-api/document?path=' + encodeURIComponent(path);

  log.debug('fetching data from content API from URL', fetchUrl);

  const response = await fetch(fetchUrl, {
    headers: buildNeosHeaders(),
    cache: 'no-store',
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

      return undefined;
    }
  }

  const data: NeosData = await response.json();
  const endTime = Date.now();
  log.debug('fetched data from content API for path', path, ', took', `${endTime - startTime}ms`);

  return data;
};

export const loadPreviewDocumentProps = async (searchParams: { [key: string]: string | string[] | undefined }) => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  const contextPath = searchParams['node[__contextNodePath]'];
  if (typeof contextPath !== 'string') {
    throw new Error('Missing context path query parameter');
  }

  const startTime = Date.now();
  const fetchUrl = apiUrl + '/neos/content-api/document?contextPath=' + encodeURIComponent(contextPath);
  const response = await fetch(fetchUrl, {
    headers: buildNeosPreviewHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      log.debug('content API returned 404 for context path', contextPath);

      return undefined;
    }

    const data: ApiErrors = await response.json();
    if (data.errors) {
      const flatErrors = data.errors.map((e) => e.message).join(', ');
      log.error('error fetching from content API with url', fetchUrl, ':', flatErrors);

      return undefined;
    }
  }

  const data: NeosData = await response.json();
  const endTime = Date.now();
  log.debug('fetched data from content API for context path', contextPath, ', took', `${endTime - startTime}ms`);

  return data;
};

export const loadDocumentPropsCached = cache((routePath: string | undefined) => {
  if (!routePath) {
    return undefined;
  }
  log.debug('fetching data from Neos inside cache with route path', routePath);
  const slug = routePath.split('/').filter((s) => s.length > 0);
  return loadDocumentProps({ slug });
});

export const loadPreviewDocumentPropsCached = cache((contextNodePath: string | undefined) => {
  if (!contextNodePath) {
    return undefined;
  }
  log.debug('fetching data from Neos inside cache with context node path', contextNodePath);
  const searchParams = { 'node[__contextNodePath]': contextNodePath };
  return loadPreviewDocumentProps(searchParams);
});

export const buildNeosHeaders = () => {
  const headers: Record<string, string> = {};

  // If PUBLIC_BASE_URL is set, we set the X-Forwarded-* headers from it
  if (process.env.PUBLIC_BASE_URL) {
    applyProxyHeaders(headers, process.env.PUBLIC_BASE_URL);
  }

  return headers;
};

export const loadSiteProps = async () => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  const startTime = Date.now();
  const fetchUrl = apiUrl + '/neos/content-api/site';

  log.debug('fetching data from content API from URL', fetchUrl);

  const response = await fetch(fetchUrl, {
    headers: buildNeosHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const data: ApiErrors = await response.json();
    if (data.errors) {
      const flatErrors = data.errors.map((e) => e.message).join(', ');
      log.error('error fetching from content API with url', fetchUrl, ':', flatErrors);

      return undefined;
    }
  }

  const data: SiteData = await response.json();
  const endTime = Date.now();
  log.debug('fetched data from content API with url', fetchUrl, ', took', `${endTime - startTime}ms`);

  return data;
};

export const buildNeosPreviewHeaders = () => {
  const _headers = nextHeaders();

  const headers: HeadersInit = {
    // Pass the cookie to headless API to forward the Neos session
    Cookie: _headers.get('cookie') ?? '',
  };

  // If PUBLIC_BASE_URL is set, we set the X-Forwarded-* headers from it
  if (process.env.PUBLIC_BASE_URL) {
    applyProxyHeaders(headers, process.env.PUBLIC_BASE_URL);
  } else {
    const _host = _headers.get('host');
    // Set forwarded host and port to make sure URIs in metadata are correct
    if (_host) {
      // Split host and port from header
      const [host, port] = _host.split(':');

      headers['X-Forwarded-Host'] = host;
      if (port) {
        headers['X-Forwarded-Port'] = port;
      } else {
        const _proto = _headers.get('x-forwarded-proto');
        // Check if HTTPS or HTTP request and set default port to make sure Neos does not use port of an internal endpoint
        headers['X-Forwarded-Port'] = _proto === 'https' ? '443' : '80';
        headers['X-Forwarded-Proto'] = typeof _proto === 'string' ? _proto : 'http';
      }
    }
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
