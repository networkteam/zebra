import log from 'loglevel';
import { GetServerSidePropsContext, GetStaticPathsContext, GetStaticPropsContext, NextConfig } from 'next';

import { ApiErrors, BackendProps, DocumentsResponse, NeosContentNode, NeosData } from '../types';

log.setDefaultLevel(log.levels.DEBUG);

export const loadStaticPaths = async ({ locales, defaultLocale }: GetStaticPathsContext) => {
  const apiUrl = process.env.NEOS_BASE_URL;
  if (!apiUrl) {
    throw new Error('Missing NEOS_BASE_URL environment variable');
  }

  const startTime = Date.now();
  const response = await fetch(apiUrl + '/neos/content-api/documents');

  if (!response.ok) {
    const data: ApiErrors = await response.json();
    if (data.errors) {
      throw new Error('Content API responded with error: ' + data.errors.map((e) => e.message).join(', '));
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
  const response = await fetch(apiUrl + '/neos/content-api/document?path=' + encodeURIComponent(path));

  if (!response.ok) {
    if (response.status === 404) {
      log.debug('content API returned 404 for path', path);

      return undefined;
    }

    const data: ApiErrors = await response.json();
    if (data.errors) {
      throw new Error('Content API responded with error: ' + data.errors.map((e) => e.message).join(', '));
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
  const response = await fetch(apiUrl + '/neos/content-api/document?contextPath=' + encodeURIComponent(contextPath), {
    headers: {
      // Pass the cookie to content API to forward the Neos session
      Cookie: req.headers.cookie ?? '',
    },
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
      throw new Error('Content API responded with error: ' + data.errors.map((e) => e.message).join(', '));
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
  const response = await fetch(apiUrl + '/neos/content-api/node?contextPath=' + encodeURIComponent(contextPath), {
    headers: {
      // Pass the cookie to content API to forward the Neos session
      Cookie: req.headers.cookie ?? '',
    },
  });

  if (!response.ok) {
    const data: ApiErrors = await response.json();
    if (data.errors) {
      throw new Error('Content API responded with error: ' + data.errors.map((e) => e.message).join(', '));
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

export const nodeMetadata = (node: NeosContentNode) => {
  const metadata: Record<string, any> = {};
  const addMetadata = (node: NeosContentNode) => {
    metadata[node.contextPath] = node.backend?.serializedNode;
    node.children?.forEach((child) => addMetadata(child));
  };
  addMetadata(node);
  return metadata;
};

// Use useEffect to prevent errors with Rehydration to set Neos metadata
export const injectNeosBackendMetadata = (node: NeosContentNode, backend: BackendProps | undefined) => {
  (window as any)['@Neos.Neos.Ui:DocumentInformation'] = backend?.documentInformation;
  (window as any)['@Neos.Neos.Ui:Nodes'] = nodeMetadata(node);

  if (!document.getElementById('_neos-ui-css')) {
    const hostCss = document.createElement('link');
    hostCss.id = '_neos-ui-css';
    hostCss.rel = 'stylesheet';
    hostCss.href = '/_Resources/Static/Packages/Neos.Neos.Ui.Compiled/Styles/Host.css';
    document.head.appendChild(hostCss);
  }

  if (!document.getElementById('_neos-next-window')) {
    const nextWindow = document.createElement('script');
    nextWindow.id = '_neos-next-window';
    nextWindow.innerHTML = 'window.neos = window.parent.neos;';
    document.head.appendChild(nextWindow);
  }

  if (!document.getElementById('_neos-ui-vendor')) {
    const vendorScript = document.createElement('script');
    vendorScript.id = '_neos-ui-vendor';
    vendorScript.src = '/_Resources/Static/Packages/Neos.Neos.Ui.Compiled/JavaScript/Vendor.js';
    document.head.appendChild(vendorScript);
  }

  if (!document.getElementById('_neos-ui-guest')) {
    const guestScript = document.createElement('script');
    guestScript.id = '_neos-ui-guest';
    guestScript.src = '/_Resources/Static/Packages/Neos.Neos.Ui.Compiled/JavaScript/Guest.js';
    document.head.appendChild(guestScript);
  }

  const event = new CustomEvent('Neos.Neos.Ui.ContentReady');
  console.debug('Neos.Neos.Ui.ContentReady');
  window.parent.document.dispatchEvent(event);

  // TODO Check if we can do it differently
  document.body.classList.add('neos-backend');
};

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
