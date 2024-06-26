import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

import { NeosContentNode } from '../types';
import NeosContext from './context';

export const useMeta = () => {
  const context = useContext(NeosContext)!;
  return context?.meta;
};

export const useNode = () => {
  const context = useContext(NeosContext)!;
  return context?.node;
};

export const useDocumentNode = () => {
  const context = useContext(NeosContext)!;
  return context?.documentNode;
};

export const useSiteNode = () => {
  const context = useContext(NeosContext)!;
  return context?.site;
};

export const useInBackend = () => {
  const context = useContext(NeosContext)!;
  return context?.inBackend;
};

export const useEditPreviewMode = () => {
  const context = useContext(NeosContext)!;
  return context?.editPreviewMode;
};

export const useContentComponent = () => {
  const { contextPath, backend } = useNode();
  const inBackend = useInBackend();

  useEffect(() => {
    if (!inBackend) return;

    (window as any)['@Neos.Neos.Ui:Nodes'] = {
      ...(window as any)['@Neos.Neos.Ui:Nodes'],
      [contextPath]: backend?.serializedNode,
    };
  }, []);

  return {
    'data-__neos-node-contextpath': inBackend ? contextPath : undefined,
    // Use a fixed fusion path to render an out-of-band preview of this node.
    // The Networkteam.Neos.Next package provides a Fusion prototype that renders the node through Next.js.
    'data-__neos-fusion-path': inBackend ? 'neosNext/previewNode' : undefined,
  };
};

export const useContentCollection = (nodeName?: string) => {
  const neosContext = useContext(NeosContext);
  const inBackend = useInBackend();

  if (!neosContext) {
    throw new Error('NeosContext must be provided for useContentCollection hook');
  }

  let collectionNode: NeosContentNode | undefined = neosContext.node;

  if (nodeName) {
    const { children } = neosContext.node;
    collectionNode = children?.find((childNode) => childNode.nodeName === nodeName);
  }

  useEffect(() => {
    if (!collectionNode || !inBackend) return;

    (window as any)['@Neos.Neos.Ui:Nodes'] = {
      ...(window as any)['@Neos.Neos.Ui:Nodes'],
      [collectionNode.contextPath]: collectionNode.backend?.serializedNode,
    };
  }, [collectionNode]);

  if (!collectionNode) {
    return {
      collectionNode: neosContext.node,
      collectionProps: {},
    };
  }

  return {
    collectionNode,
    collectionProps: {
      'data-__neos-node-contextpath': inBackend ? collectionNode.contextPath : undefined,
      // Use a fixed fusion path to render an out-of-band preview of this node
      'data-__neos-fusion-path': inBackend ? 'neosNext/previewNode' : undefined,
      'data-__neos-insertion-anchor': inBackend ? true : undefined,
    },
  };
};

// Hook to notify the iframe host about route changes (with fake unload / load events)
export const useNotifyContentCanvasRouteChanges = () => {
  const router = useRouter();

  const onRouteChangeStart = () => {
    // Dispatch an unload event for the ContentCanvas to start the loading animation
    const event = new CustomEvent('unload');
    window.dispatchEvent(event);

    // Workaround: we need to reset the initialized state of the document for a correct reset (e.g. focused element) and loading to stop
    delete document.__isInitialized;
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
};
