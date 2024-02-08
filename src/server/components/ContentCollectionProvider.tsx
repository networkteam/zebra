import { ReactNode } from 'react';

import { ContextProps } from '../../types';
import { withContentCollection } from '../utils/hooks';
import ContentComponentIncludes from './client/ContentComponentIncludes';
import NodeRenderer from './NodeRenderer';

type ContentCollectionProviderProps = {
  ctx: ContextProps;
  nodeName?: string;
  children: ({
    collectionProps,
    children,
  }: {
    collectionProps: Record<string, string | boolean | undefined>;
    children: ReactNode;
  }) => ReactNode;
};

const ContentCollectionProvider = async ({ ctx, nodeName, children }: ContentCollectionProviderProps) => {
  const inBackend = ctx.inBackend;
  const { collectionNode, collectionProps } = await withContentCollection(ctx, nodeName);

  if (!collectionNode) {
    return null;
  }

  return (
    <>
      {children({
        collectionProps,
        children: (
          <>
            {collectionNode.children?.map((child) => (
              <NodeRenderer key={child.identifier} ctx={ctx} node={child} />
            ))}
            {inBackend && (
              <ContentComponentIncludes
                contextPath={collectionNode.contextPath}
                serializedNode={collectionNode.backend?.serializedNode}
              />
            )}
          </>
        ),
      })}
    </>
  );
};

export default ContentCollectionProvider;
