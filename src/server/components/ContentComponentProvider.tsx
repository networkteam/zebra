import { ContextProps } from 'src/types';

import { useInBackend } from '../utils/hooks';
import { useContentComponent } from '../utils/hooks';
import ContentComponentIncludes from './client/ContentComponentIncludes';

type ContentComponentProviderProps = {
  ctx: ContextProps;
  children: ({
    componentProps,
    includes,
  }: {
    componentProps: Record<string, string | boolean | undefined>;
    includes: React.ReactNode;
  }) => React.ReactNode;
};

const ContentComponentProvider = async ({ ctx, children }: ContentComponentProviderProps) => {
  const inBackend = useInBackend(ctx);
  const { componentNode, componentProps } = await useContentComponent(ctx)();

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
