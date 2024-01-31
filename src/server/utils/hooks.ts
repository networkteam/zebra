import { ContextProps, DataLoaderOptions } from '../../types';
import { loadDocumentPropsCached, loadPreviewDocumentPropsCached } from './dataLoader';
import { resolveCurrentNode } from './helper';

export const useMeta = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return async () => {
    const neosData = ctx.inBackend
      ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts)
      : await loadDocumentPropsCached(ctx.routePath, opts);

    return neosData?.meta;
  };
};

export const useNode = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return async () => {
    const neosData = ctx.inBackend
      ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts)
      : await loadDocumentPropsCached(ctx.routePath, opts);

    if (!neosData) {
      return undefined;
    }

    const node = resolveCurrentNode(ctx, neosData);

    return node;
  };
};

export const useDocumentNode = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return async () => {
    const neosData = ctx.inBackend
      ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts)
      : await loadDocumentPropsCached(ctx.routePath, opts);

    return neosData?.node;
  };
};

export const useSiteNode = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return async () => {
    const neosData = ctx.inBackend
      ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts)
      : await loadDocumentPropsCached(ctx.routePath, opts);

    return neosData?.site;
  };
};

export const useInBackend = (ctx: ContextProps) => {
  return !!ctx?.inBackend;
};

export const useEditPreviewMode = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return async () => {
    const neosData = await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts);

    return neosData?.backend?.editPreviewMode;
  };
};

export const useContentCollection = (ctx: ContextProps, nodeName?: string, opts?: DataLoaderOptions) => {
  const inBackend = useInBackend(ctx);

  return async () => {
    const neosData = inBackend
      ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts)
      : await loadDocumentPropsCached(ctx.routePath, opts);

    if (!neosData) {
      return {
        collectionNode: undefined,
        collectionProps: {},
      };
    }

    const currentNode = resolveCurrentNode(ctx, neosData);
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

export const useContentComponent = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  const inBackend = useInBackend(ctx);

  return async () => {
    const node = await useNode(ctx, opts)();

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
