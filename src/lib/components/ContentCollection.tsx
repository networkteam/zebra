import classNames from 'classnames';
import { useContext } from 'react';

import { NeosContentNode } from '../../types';
import NeosContext from '../../utils/context';
import { useInBackend } from '../../utils/hooks';
import ChildNodes from './ChildNodes';

type ContentCollectionProps = {
  as?: keyof JSX.IntrinsicElements;
  nodeName?: string;
  [x: string]: any;
};

export default function ContentCollection({ as = 'div', nodeName, ...rest }: ContentCollectionProps) {
  const neosContext = useContext(NeosContext);
  const inBackend = useInBackend();

  if (!neosContext) {
    throw new Error('NeosContext must be provided for ContentCollection');
  }

  const { className, ...restAttributes } = rest;
  const Component = as;

  let collectionNode: NeosContentNode | undefined = neosContext.node;

  if (nodeName) {
    const { children } = neosContext.node;
    collectionNode = children?.find((childNode) => childNode.nodeName === nodeName);
  }
  if (!collectionNode) return null;

  return (
    <NeosContext.Provider value={{ ...neosContext, node: collectionNode }}>
      <Component
        className={classNames(className, {
          'neos-contentcollection': inBackend,
        })}
        data-__neos-node-contextpath={inBackend ? collectionNode.contextPath : undefined}
        // Use a fixed fusion path to render an out-of-band preview of this node
        data-__neos-fusion-path={inBackend ? 'neosNext/previewNode' : undefined}
        data-__neos-insertion-anchor={inBackend ? true : undefined}
        {...restAttributes}
      >
        <ChildNodes />
      </Component>
    </NeosContext.Provider>
  );
}
