import { useEffect } from 'react';

import { NeosNodeTypes, NeosData } from '../../types';
import NeosContext from '../../utils/context';
import { injectNeosBackendMetadata } from '../../utils/helper';
import ContentRegistry from '../components/ContentRegistry';

export default function Preview({ meta, site, node, backend }: NeosData, nodeTypes: NeosNodeTypes) {
  const inBackend = true;

  useEffect(() => {
    injectNeosBackendMetadata(node, backend);
  }, [node, backend]);

  return (
    <NeosContext.Provider value={{ node, documentNode: node, site, meta, inBackend, nodeTypes }}>
      <ContentRegistry node={node} />
    </NeosContext.Provider>
  );
}
