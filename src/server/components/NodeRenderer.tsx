import { useContext } from 'react';

import { NeosContentNode } from '../../types';
import { NeosServerContext } from '../utils/context';
import { loadDocumentPropsCached, loadPreviewDocumentPropsCached } from '../utils/dataLoader';
import { getNodeType } from '../utils/nodeTypes';

const NodeRenderer = async ({ node }: { node: NeosContentNode }) => {
  const neosContext = useContext(NeosServerContext);

  // We just fetch again and hope it will be cached
  const neosData = neosContext.inBackend
    ? await loadPreviewDocumentPropsCached(neosContext.contextNodePath)
    : await loadDocumentPropsCached(neosContext.routePath);

  if (!neosData) {
    return <div>Could not load data</div>;
  }

  const Component = getNodeType(node.nodeType);

  if (!Component) {
    return <div>Could not find mapping for node type {node.nodeType}</div>;
  }

  return (
    <NeosServerContext.Provider
      value={{
        ...neosContext,
        currentNodeIdentifier: node.identifier,
      }}
    >
      <Component />
    </NeosServerContext.Provider>
  );
};

export default NodeRenderer;
