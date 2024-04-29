'use client';

import { useEffect } from 'react';

const ContentComponentIncludes = ({ contextPath, serializedNode }: { contextPath: string; serializedNode: any }) => {
  // Use useEffect to prevent errors with rehydration to set Neos metadata
  useEffect(() => {
    (window as any)['@Neos.Neos.Ui:Nodes'] = {
      ...(window as any)['@Neos.Neos.Ui:Nodes'],
      [contextPath]: serializedNode,
    };
  }, []);

  return null;
};

export default ContentComponentIncludes;
