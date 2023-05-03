import { useContentComponent, useInBackend } from '../../utils/hooks';

type ContentComponentProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
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
