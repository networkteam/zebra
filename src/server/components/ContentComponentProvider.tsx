import { ReactNode } from 'react';

import { ContextProps } from '../../types';
import { withContentComponent } from '../utils/hooks';
import ContentComponentIncludes from './client/ContentComponentIncludes';

type ContentComponentProviderProps = {
  ctx: ContextProps;
  children: ({
    componentProps,
    includes,
  }: {
    componentProps: Record<string, string | boolean | undefined>;
    includes: ReactNode;
  }) => ReactNode;
};

const ContentComponentProvider = async ({ ctx, children }: ContentComponentProviderProps) => {
  const inBackend = ctx.inBackend;
  const { componentNode, componentProps } = await withContentComponent(ctx);

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
