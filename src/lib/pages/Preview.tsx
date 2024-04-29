import { useEffect } from 'react';

import { NeosData, NeosNodeTypes } from '../../types';
import { injectNeosBackendMetadata } from '../../utils/backendIncludes';
import NeosContext from '../../utils/context';
import { useNotifyContentCanvasRouteChanges } from '../../utils/hooks';
import ContentRegistry from '../components/ContentRegistry';

export default function Preview({ meta, site, node, backend }: NeosData, nodeTypes: NeosNodeTypes) {
  const inBackend = true;

  // Use useEffect to prevent errors with rehydration to set Neos metadata
  useEffect(() => {
    injectNeosBackendMetadata(backend);
  }, [backend]);

  useNotifyContentCanvasRouteChanges();

  return (
    <>
      <NeosContext.Provider
        value={{
          node,
          documentNode: node,
          site,
          meta,
          nodeTypes,
          inBackend,
          editPreviewMode: backend?.editPreviewMode,
        }}
      >
        <ContentRegistry node={node} />
      </NeosContext.Provider>
    </>
  );
}
