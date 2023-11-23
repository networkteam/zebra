import { useInBackend } from '../utils/hooks';
import ContentCollectionProvider from './ContentCollectionProvider';

type ContentCollectionProps = {
  as?: keyof JSX.IntrinsicElements;
  nodeName?: string;
  [x: string]: any;
};

const ContentCollection = async ({ as = 'div', nodeName, ...rest }: ContentCollectionProps) => {
  const inBackend = useInBackend();

  const { className, ...restAttributes } = rest;
  const Component = as;

  return (
    <ContentCollectionProvider nodeName={nodeName}>
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
