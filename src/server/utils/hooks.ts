import { useContext } from 'react';

import { NeosServerContext } from './context';
import { loadDocumentPropsCached, loadPreviewDocumentPropsCached } from './dataLoader';
import { resolveCurrentNode } from './helper';

export const useMeta = () => {
  const neosContext = useContext(NeosServerContext);

  return async () => {
    const neosData = neosContext.inBackend
      ? await loadPreviewDocumentPropsCached(neosContext.contextNodePath)
      : await loadDocumentPropsCached(neosContext.routePath);

    return neosData?.meta;
  };
};

export const useNode = () => {
  const neosContext = useContext(NeosServerContext);

  return async () => {
    const neosData = neosContext.inBackend
      ? await loadPreviewDocumentPropsCached(neosContext.contextNodePath)
      : await loadDocumentPropsCached(neosContext.routePath);

    if (!neosData) {
      return undefined;
    }

    const node = resolveCurrentNode(neosContext, neosData);

    return node;
  };
};

export const useDocumentNode = () => {
  const neosContext = useContext(NeosServerContext);

  return async () => {
    const neosData = neosContext.inBackend
      ? await loadPreviewDocumentPropsCached(neosContext.contextNodePath)
      : await loadDocumentPropsCached(neosContext.routePath);

    return neosData?.node;
  };
};

export const useSiteNode = () => {
  const neosContext = useContext(NeosServerContext);

  return async () => {
    const neosData = neosContext.inBackend
      ? await loadPreviewDocumentPropsCached(neosContext.contextNodePath)
      : await loadDocumentPropsCached(neosContext.routePath);

    return neosData?.site;
  };
};

export const useInBackend = () => {
  const neosContext = useContext(NeosServerContext);
  return !!neosContext?.inBackend;
};

export const useEditPreviewMode = () => {
  const neosContext = useContext(NeosServerContext);

  return async () => {
    const neosData = await loadPreviewDocumentPropsCached(neosContext.contextNodePath);

    return neosData?.backend?.editPreviewMode;
  };
};

export const useContentCollection = (nodeName?: string) => {
  const inBackend = useInBackend();
  const neosContext = useContext(NeosServerContext);

  return async () => {
    const neosData = inBackend
      ? await loadPreviewDocumentPropsCached(neosContext.contextNodePath)
      : await loadDocumentPropsCached(neosContext.routePath);

    if (!neosData) {
      return {
        collectionNode: undefined,
        collectionProps: {},
      };
    }

    const currentNode = resolveCurrentNode(neosContext, neosData);
    const collectionNode = nodeName ? currentNode?.children?.find((child) => child.nodeName === nodeName) : currentNode;

    if (!collectionNode) {
      return {
        collectionNode: undefined,
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
};

export const useContentComponent = () => {
  const inBackend = useInBackend();

  return async () => {
    const node = await useNode()();

    if (!node) {
      return {
        componentNode: undefined,
        componentProps: {},
      };
    }

    return {
      componentNode: node,
      componentProps: {
        'data-__neos-node-contextpath': inBackend ? node.contextPath : undefined,
        // Use a fixed fusion path to render an out-of-band preview of this node.
        // The Networkteam.Neos.Next package provides a Fusion prototype that renders the node through Next.js.
        'data-__neos-fusion-path': inBackend ? 'neosNext/previewNode' : undefined,
      },
    };
  };
};
