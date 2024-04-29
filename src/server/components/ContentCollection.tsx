import { ContextProps } from '../../types';
import ContentCollectionProvider from './ContentCollectionProvider';

type ContentCollectionProps = {
  ctx: ContextProps;
  as?: keyof JSX.IntrinsicElements;
  nodeName?: string;
  [x: string]: any;
};

const ContentCollection = async ({ ctx, as = 'div', nodeName, ...rest }: ContentCollectionProps) => {
  const inBackend = ctx.inBackend;

  const { className, ...restAttributes } = rest;
  const Component = as;

  return (
    <ContentCollectionProvider ctx={ctx} nodeName={nodeName}>
      {({ collectionProps, children }) => (
        <Component
          className={[inBackend ? 'neos-contentcollection' : '', className].join(' ')}
          {...collectionProps}
          {...restAttributes}
        >
          {children}
        </Component>
      )}
    </ContentCollectionProvider>
  );
};

export default ContentCollection;
