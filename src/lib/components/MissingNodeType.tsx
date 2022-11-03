import { NeosContentNode } from '../../types';

export default function MissingNodeType({ node }: { node: NeosContentNode }) {
  const styles = {
    padding: '0.25rem',
    background: '#FFF7ED',
    borderRadius: '0.375rem',
    border: '1px dashed #F97316',
  };

  return (
    <div style={styles}>
      Missing <strong>{node.nodeType}</strong> in ContentRegistry
    </div>
  );
}
