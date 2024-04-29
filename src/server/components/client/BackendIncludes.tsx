'use client';

import { useEffect } from 'react';

import { BackendProps } from '../../../types';
import { injectNeosBackendMetadata } from '../../../utils/backendIncludes';

const BackendIncludes = ({ backend }: { backend?: BackendProps }) => {
  // Use useEffect to prevent errors with rehydration to set Neos metadata
  useEffect(() => {
    injectNeosBackendMetadata(backend);
  }, [backend]);

  return null;
};

export default BackendIncludes;
