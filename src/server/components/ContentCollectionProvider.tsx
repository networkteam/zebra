import { useInBackend } from '../utils/hooks';
import { useContentCollection } from '../utils/hooks';
import ContentComponentIncludes from './client/ContentComponentIncludes';
import NodeRenderer from './NodeRenderer';

type ContentCollectionProviderProps = {
  nodeName?: string;
  children: ({
    collectionProps,
    children,
  }: {
    collectionProps: Record<string, string | boolean | undefined>;
    children: React.ReactNode;
  }) => React.ReactNode;
};

const ContentCollectionProvider = async ({ nodeName, children }: ContentCollectionProviderProps) => {
  const inBackend = useInBackend();
  const { collectionNode, collectionProps } = await useContentCollection(nodeName)();

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
              <NodeRenderer key={child.identifier} node={child} />
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
