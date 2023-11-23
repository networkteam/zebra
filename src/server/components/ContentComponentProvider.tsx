import { useInBackend } from '../utils/hooks';
import { useContentComponent } from '../utils/hooks';
import ContentComponentIncludes from './client/ContentComponentIncludes';

type ContentComponentProviderProps = {
  children: ({
    componentProps,
    includes,
  }: {
    componentProps: Record<string, string | boolean | undefined>;
    includes: React.ReactNode;
  }) => React.ReactNode;
};

const ContentComponentProvider = async ({ children }: ContentComponentProviderProps) => {
  const inBackend = useInBackend();
  const { componentNode, componentProps } = await useContentComponent()();

  if (!componentNode) {
    return null;
  }

  return (
    <>
      {children({
        componentProps,
        includes: inBackend && (
          <ContentComponentIncludes
            contextPath={componentNode.contextPath}
            serializedNode={componentNode.backend?.serializedNode}
          />
        ),
      })}
    </>
  );
};

export default ContentComponentProvider;
