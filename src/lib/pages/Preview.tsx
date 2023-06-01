import { useEffect, useState } from 'react';

import { NeosNodeTypes, NeosData, BackendProps } from '../../types';
import NeosContext from '../../utils/context';
import { injectNeosBackendMetadata } from '../../utils/helper';
import ContentRegistry from '../components/ContentRegistry';
import { useNotifyContentCanvasRouteChanges } from '../../utils/helper';

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
