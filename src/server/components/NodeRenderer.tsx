import { ContextProps, NeosContentNode } from '../../types';
import { loadDocumentPropsCached, loadPreviewDocumentPropsCached } from '../utils/dataLoader';
import { getNodeType } from '../utils/nodeTypes';

type NodeRendererProps = {
  ctx: ContextProps;
  node: NeosContentNode;
};

const NodeRenderer = async ({ ctx, node }: NodeRendererProps) => {
  // We just fetch again and hope it will be cached
  const neosData = ctx.inBackend
    ? await loadPreviewDocumentPropsCached(ctx.contextNodePath, ctx.dataLoaderOptions)
    : await loadDocumentPropsCached(ctx.routePath, ctx.dataLoaderOptions);

  if (!neosData) {
    return <div>Could not load data</div>;
  }

  const Component = getNodeType(node.nodeType);

  if (!Component) {
    return <div>Could not find mapping for node type {node.nodeType}</div>;
  }

  return (
    <Component
      ctx={{
        ...ctx,
        currentNodeIdentifier: node.identifier,
      }}
    />
  );
};

export default NodeRenderer;
