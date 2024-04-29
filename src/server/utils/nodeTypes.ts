import { FC } from 'react';

import { ContextProps, NeosNodeTypes } from '../../types';

let nodeTypes: NeosNodeTypes;

export function initNodeTypes(data: NeosNodeTypes) {
  nodeTypes = data;
}

export function getNodeType(nodeTypeName: string): FC<{ ctx: ContextProps }> | undefined {
  return nodeTypes?.[nodeTypeName];
}
