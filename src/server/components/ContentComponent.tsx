import { ReactNode } from 'react';

import { ContextProps } from '../../types';
import ContentComponentProvider from './ContentComponentProvider';

type ContentComponentProps = {
  ctx: ContextProps;
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
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
