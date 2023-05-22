import { Fragment, useEffect } from 'react';
import Head from 'next/head';

import { NeosNodeTypes, NeosData } from '../../types';
import NeosContext from '../../utils/context';
import { guestFrameIncludes, injectNeosBackendMetadata, useNotifyContentCanvasRouteChanges } from '../../utils/helper';
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
      <Head>
        <Fragment key="neos-ui-guest">{guestFrameIncludes(backend)}</Fragment>
      </Head>
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
