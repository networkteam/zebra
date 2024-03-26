import { ContextProps, DataLoaderOptions, OptionalOption } from '../../types';
import { loadDocumentPropsCached, loadPreviewDocumentPropsCached } from './dataLoader';
import { resolveCurrentNode } from './helper';

/**
 * @deprecated Use withMeta instead (async hooks are not allowed by ESLint rules)
 */
export const useMeta = (ctx: ContextProps, opts?: DataLoaderOptions & OptionalOption) => {
  return () => withMeta(ctx, opts);
};

export const withMeta = async (ctx: ContextProps, opts?: DataLoaderOptions) => {
  const neosData = ctx.inBackend
    ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts ?? ctx.dataLoaderOptions)
    : await loadDocumentPropsCached(ctx.routePath, opts ?? ctx.dataLoaderOptions);
  if (!neosData) {
    throw new Error(`Node not found: ${ctx.inBackend ? ctx.contextNodePath : ctx.routePath}`);
  }

  if ('meta' in neosData) {
    return neosData.meta;
  }

  return undefined;
};

/**
 * @deprecated Use withNode instead (async hooks are not allowed by ESLint rules)
 */
export const useNode = (ctx: ContextProps, opts?: DataLoaderOptions & OptionalOption) => {
  return () => withNode(ctx, opts);
};

export const withNode = async (ctx: ContextProps, opts?: DataLoaderOptions) => {
  const neosData = ctx.inBackend
    ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts ?? ctx.dataLoaderOptions)
    : await loadDocumentPropsCached(ctx.routePath, opts ?? ctx.dataLoaderOptions);
  if (!neosData) {
    throw new Error(`Document node not found: ${ctx.inBackend ? ctx.contextNodePath : ctx.routePath}`);
  }
  if ('redirect' in neosData) {
    throw new Error(`Redirect found for node at path: ${ctx.routePath}`);
  }

  const node = resolveCurrentNode(ctx, neosData);
  if (!node) {
    throw new Error(`Could not resolve current node: ${ctx.currentNodeIdentifier}`);
  }

  return node;
};

/**
 * @deprecated Use withDocumentNode instead (async hooks are not allowed by ESLint rules)
 */
export const useDocumentNode = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return () => withDocumentNode(ctx, opts);
};

export const withDocumentNode = async (ctx: ContextProps, opts?: DataLoaderOptions) => {
  const neosData = ctx.inBackend
    ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts ?? ctx.dataLoaderOptions)
    : await loadDocumentPropsCached(ctx.routePath, opts ?? ctx.dataLoaderOptions);
  if (!neosData) {
    throw new Error(`Document node not found: ${ctx.inBackend ? ctx.contextNodePath : ctx.routePath}`);
  }
  if ('redirect' in neosData) {
    throw new Error(`Redirect found for node at path: ${ctx.routePath}`);
  }

  return neosData.node;
};

/**
 * @deprecated Use withSiteNode instead (async hooks are not allowed by ESLint rules)
 */
export const useSiteNode = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return () => withSiteNode(ctx, opts);
};

export const withSiteNode = async (ctx: ContextProps, opts?: DataLoaderOptions) => {
  const neosData = ctx.inBackend
    ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts ?? ctx.dataLoaderOptions)
    : await loadDocumentPropsCached(ctx.routePath, opts ?? ctx.dataLoaderOptions);
  if (!neosData) {
    throw new Error(`Document node not found: ${ctx.inBackend ? ctx.contextNodePath : ctx.routePath}`);
  }
  if ('redirect' in neosData) {
    throw new Error(`Redirect found for node at path: ${ctx.routePath}`);
  }

  return neosData.site;
};

/**
 * @deprecated Use ctx.inBackend instead (async hooks are not allowed by ESLint rules)
 */
export const useInBackend = (ctx: ContextProps) => {
  return !!ctx?.inBackend;
};

/**
 * @deprecated Use withEditPreviewMode instead (async hooks are not allowed by ESLint rules)
 */
export const useEditPreviewMode = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return () => withEditPreviewMode(ctx, opts);
};

export const withEditPreviewMode = async (ctx: ContextProps, opts?: DataLoaderOptions) => {
  if (!ctx.inBackend) {
    return undefined;
  }

  const neosData = await loadPreviewDocumentPropsCached(ctx.contextNodePath, opts ?? ctx.dataLoaderOptions);
  if (!neosData) {
    throw new Error(`Document node not found: ${ctx.contextNodePath}`);
  }

  return neosData.backend?.editPreviewMode;
};

/**
 * @deprecated Use withContentCollection instead (async hooks are not allowed by ESLint rules)
 */
export const useContentCollection = (ctx: ContextProps, nodeName?: string, opts?: DataLoaderOptions) => {
  return () => withContentCollection(ctx, nodeName, opts);
};

export const withContentCollection = async (ctx: ContextProps, nodeName?: string, opts?: DataLoaderOptions) => {
  const inBackend = ctx.inBackend;

  const currentNode = await withNode(ctx, opts);

  const collectionNode = nodeName ? currentNode.children?.find((child) => child.nodeName === nodeName) : currentNode;
  if (!collectionNode) {
    throw new Error(`Child node not found: ${nodeName}`);
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

/**
 * @deprecated Use withContentComponent instead (async hooks are not allowed by ESLint rules)
 */
export const useContentComponent = (ctx: ContextProps, opts?: DataLoaderOptions) => {
  return () => withContentComponent(ctx, opts);
};

export const withContentComponent = async (ctx: ContextProps, opts?: DataLoaderOptions) => {
  const inBackend = ctx.inBackend;

  const node = await withNode(ctx, opts);

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
