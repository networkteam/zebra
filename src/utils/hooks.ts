import { useContext } from 'react';

import { NeosContextProps } from '../types';
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
