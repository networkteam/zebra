import { useContext, useEffect } from 'react';

import { NeosContentNode, NeosContextProps } from '../types';
import NeosContext from './context';

export const useMeta = () => {
  const context = useContext(NeosContext) as NeosContextProps;
  return context?.meta;
};

export const useNode = () => {
  const context = useContext(NeosContext) as NeosContextProps;
  return context?.node;
};

export const useDocumentNode = () => {
  const context = useContext(NeosContext) as NeosContextProps;
  return context?.documentNode;
};

export const useSiteNode = () => {
  const context = useContext(NeosContext) as NeosContextProps;
  return context?.site;
};

export const useInBackend = () => {
  const context = useContext(NeosContext) as NeosContextProps;
  return context?.inBackend;
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
    // Use a fixed fusion path to render an out-of-band preview of this node
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

  if (!collectionNode) {
    return {
      collectionNode: neosContext.node,
      collectionProps: {},
    };
  }

  useEffect(() => {
    if (!collectionNode || !inBackend) return;

    (window as any)['@Neos.Neos.Ui:Nodes'] = {
      ...(window as any)['@Neos.Neos.Ui:Nodes'],
      [collectionNode.contextPath]: collectionNode.backend?.serializedNode,
    };
  }, [collectionNode]);

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
