import { useNode } from '../../utils/hooks';
import ContentRegistry from './ContentRegistry';

export default function ChildNodes() {
  const { children } = useNode();

  return (
    <>
      {children?.map((childNode) => (
        <ContentRegistry key={childNode.identifier} node={childNode} />
      ))}
    </>
  );
}
