import { ReactNode, useContext } from 'react';

import NeosContext from '../../utils/context';
import { useContentCollection } from '../../utils/hooks';
import ChildNodes from './ChildNodes';

type ContentCollectionProviderProps = {
  nodeName: string;
  children: ({
    collectionProps,
    children,
  }: {
    collectionProps: Record<string, string | boolean | undefined>;
    children: ReactNode;
  }) => ReactNode;
};

export default function ContentCollectionProvider({ nodeName, children }: ContentCollectionProviderProps) {
  const neosContext = useContext(NeosContext);
  const { collectionNode, collectionProps } = useContentCollection(nodeName);

  if (!neosContext) {
    return null;
  }

  return (
    <NeosContext.Provider value={{ ...neosContext, node: collectionNode }}>
      {children({
        collectionProps,
        children: <ChildNodes />,
      })}
    </NeosContext.Provider>
  );
}
