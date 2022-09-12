import { NeosNodeTypes, NeosData } from '../../types';
import NeosContext from '../../utils/context';
import ContentRegistry from '../components/ContentRegistry';

export default function Frontend({ node, site, meta }: NeosData, nodeTypes: NeosNodeTypes) {
  const inBackend = false;

  return (
    <NeosContext.Provider value={{ node, documentNode: node, site, meta, inBackend, nodeTypes }}>
      <ContentRegistry node={node} />
    </NeosContext.Provider>
  );
}
