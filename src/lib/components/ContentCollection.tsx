import { useContext } from 'react';

import NeosContext from '../../utils/context';
import { useContentCollection, useInBackend } from '../../utils/hooks';
import ChildNodes from './ChildNodes';

type ContentCollectionProps = {
  as?: keyof JSX.IntrinsicElements;
  nodeName?: string;
  [x: string]: any;
};

export default function ContentCollection({ as = 'div', nodeName, ...rest }: ContentCollectionProps) {
  const neosContext = useContext(NeosContext);
  const inBackend = useInBackend();
  const { collectionNode, collectionProps } = useContentCollection(nodeName);

  if (!neosContext) {
    throw new Error('NeosContext must be provided for ContentCollection');
  }

  const { className, ...restAttributes } = rest;
  const Component = as;

  return (
    <NeosContext.Provider value={{ ...neosContext, node: collectionNode }}>
      <Component
        className={[inBackend ? 'neos-contentcollection' : '', className].join(' ')}
        {...collectionProps}
        {...restAttributes}
      >
        <ChildNodes />
      </Component>
    </NeosContext.Provider>
  );
}
