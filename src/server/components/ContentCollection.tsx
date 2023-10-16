import { useContext } from 'react';

import { NeosServerContext } from '../utils/context';
import { loadDocumentPropsCached, loadPreviewDocumentPropsCached } from '../utils/dataLoader';
import { resolveCurrentNode } from '../utils/helper';
import NodeRenderer from './NodeRenderer';
import { NeosContentNode } from '../../types';
import ContentComponentIncludes from './client/ContentComponentIncludes';

type ContentCollectionProps = {
  as?: keyof JSX.IntrinsicElements;
  nodeName?: string;
  [x: string]: any;
};

const ContentCollection = async ({ as = 'div', nodeName, ...rest }: ContentCollectionProps) => {
  const neosContext = useContext(NeosServerContext);

  const inBackend = neosContext.inBackend ?? false;

  const neosData = inBackend
    ? await loadPreviewDocumentPropsCached(neosContext.contextNodePath)
    : await loadDocumentPropsCached(neosContext.routePath);

  if (!neosData) {
    return <div>Could not load data</div>;
  }

  const currentNode = resolveCurrentNode(neosContext, neosData);

  const collectionNode = nodeName ? currentNode?.children?.find((child) => child.nodeName === nodeName) : currentNode;

  if (!collectionNode) {
    return <div>Could not find collection node {nodeName}</div>;
  }

  const { className, ...restAttributes } = rest;
  const Component = as;

  return (
    <Component
      className={[inBackend ? 'neos-contentcollection' : '', className].join(' ')}
      {...contentCollectionProps(collectionNode, inBackend)}
      {...restAttributes}
    >
      {collectionNode.children?.map((child) => (
        <NodeRenderer key={child.identifier} node={child} />
      ))}
      {inBackend && (
        <ContentComponentIncludes
          contextPath={collectionNode.contextPath}
          serializedNode={collectionNode.backend?.serializedNode}
        />
      )}
    </Component>
  );
};

const contentCollectionProps = (collectionNode: NeosContentNode, inBackend: boolean) => {
  return {
    'data-__neos-node-contextpath': inBackend ? collectionNode.contextPath : undefined,
    // Use a fixed fusion path to render an out-of-band preview of this node
    'data-__neos-fusion-path': inBackend ? 'neosNext/previewNode' : undefined,
    'data-__neos-insertion-anchor': inBackend ? true : undefined,
  };
};

export default ContentCollection;
