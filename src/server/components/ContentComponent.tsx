import { useInBackend, useNode } from '../utils/hooks';
import ContentComponentIncludes from './client/ContentComponentIncludes';

type ContentComponentProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  [x: string]: any;
};

const ContentComponent = async ({ as = 'div', children, ...rest }: ContentComponentProps) => {
  const inBackend = useInBackend();
  const loadNode = useNode();
  const node = await loadNode();

  if (!node) {
    return null;
  }

  const Component = as;

  return (
    <Component
      data-__neos-node-contextpath={inBackend ? node.contextPath : undefined}
      // Use a fixed fusion path to render an out-of-band preview of this node.
      // The Networkteam.Neos.Next package provides a Fusion prototype that renders the node through Next.js.
      data-__neos-fusion-path={inBackend ? 'neosNext/previewNode' : undefined}
      {...rest}
    >
      {children}
      {inBackend && (
        <ContentComponentIncludes contextPath={node.contextPath} serializedNode={node.backend?.serializedNode} />
      )}
    </Component>
  );
};

export default ContentComponent;
