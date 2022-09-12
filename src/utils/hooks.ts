import { useContext } from 'react';

import { NeosContextProps } from '../types';
import NeosContext from './context';

export const useMeta = () => {
  const { meta } = useContext(NeosContext) as NeosContextProps;
  return meta;
};

export const useNode = () => {
  const { node } = useContext(NeosContext) as NeosContextProps;
  return node;
};

export const useDocumentNode = () => {
  const { documentNode } = useContext(NeosContext) as NeosContextProps;
  return documentNode;
};

export const useSiteNode = () => {
  const { site } = useContext(NeosContext) as NeosContextProps;
  return site;
};

export const useInBackend = () => {
  const { inBackend } = useContext(NeosContext) as NeosContextProps;
  return inBackend;
};
