import { ContextProps } from 'src/types';

import ContentComponentProvider from './ContentComponentProvider';

type ContentComponentProps = {
  ctx: ContextProps;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  [x: string]: any;
};

const ContentComponent = async ({ ctx, as = 'div', children, ...rest }: ContentComponentProps) => {
  const Component = as;

  return (
    <ContentComponentProvider ctx={ctx}>
      {({ componentProps, includes }) => (
        <Component {...componentProps} {...rest}>
          {children}
          {includes}
        </Component>
      )}
    </ContentComponentProvider>
  );
};

export default ContentComponent;