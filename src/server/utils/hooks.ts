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
  return neosContext?.inBackend;
};

export const useEditPreviewMode = () => {
  const neosContext = useContext(NeosServerContext);

  return async () => {
    const neosData = await loadPreviewDocumentPropsCached(neosContext.contextNodePath);

    return neosData?.backend?.editPreviewMode;
  };
};
