import { ReactNode } from 'react';

import { useContentComponent } from '../../utils/hooks';

type ContentComponentProps = {
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  [x: string]: any;
};

export default function ContentComponent({ as = 'div', children, ...rest }: ContentComponentProps) {
  const componentProps = useContentComponent();
  const Component = as;

  return (
    <Component {...componentProps} {...rest}>
      {children}
    </Component>
  );
}
