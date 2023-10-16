import { NeosNodeTypes } from '../../types';

let nodeTypes: NeosNodeTypes;

export function initNodeTypes(data: NeosNodeTypes) {
  nodeTypes = data;
}

export function getNodeType(nodeTypeName: string): React.FC | undefined {
  return nodeTypes?.[nodeTypeName];
}
