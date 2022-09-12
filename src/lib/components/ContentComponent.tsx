import { useInBackend, useNode } from '../../utils/hooks';

type ContentComponentProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  [x: string]: any;
};

export default function ContentComponent({ as = 'div', children, ...rest }: ContentComponentProps) {
  const { contextPath } = useNode();
  const inBackend = useInBackend();
  const Component = as;

  return (
    <Component
      data-__neos-node-contextpath={inBackend ? contextPath : undefined}
      // Use a fixed fusion path to render an out-of-band preview of this node
      data-__neos-fusion-path={inBackend ? 'neosNext/previewNode' : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
}
