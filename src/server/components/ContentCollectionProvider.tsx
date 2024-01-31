import { ContextProps } from '../../types';
import { useInBackend } from '../utils/hooks';
import { useContentCollection } from '../utils/hooks';
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
    children: React.ReactNode;
  }) => React.ReactNode;
};

const ContentCollectionProvider = async ({ ctx, nodeName, children }: ContentCollectionProviderProps) => {
  const inBackend = useInBackend(ctx);
  const { collectionNode, collectionProps } = await useContentCollection(ctx, nodeName)();

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
