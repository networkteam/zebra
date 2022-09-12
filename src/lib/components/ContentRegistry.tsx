import { useContext } from 'react';

import { NeosContentNode } from '../../types';
import NeosContext from '../../utils/context';
import { useInBackend } from '../../utils/hooks';
import MissingNodeType from './MissingNodeType';

const ContentRegistry = ({ node }: { node: NeosContentNode }) => {
  const neosContext = useContext(NeosContext);
  const inBackend = useInBackend();

  if (!neosContext) {
    throw new Error('NeosContext must be provided for ContentRegistry');
  }

  const Component = neosContext.nodeTypes[node.nodeType];

  if (!Component) {
    if (inBackend) {
      return <MissingNodeType node={node} />;
    }
    return null;
  }

  return (
    <NeosContext.Provider value={{ ...neosContext, node }}>
      <Component />
    </NeosContext.Provider>
  );
};

export default ContentRegistry;
