import { NeosContentNode, NeosData, NeosServerContextProps } from '../../types';

export function resolveCurrentNode(
  neosContext: NeosServerContextProps,
  neosData: NeosData
): NeosContentNode | undefined {
  // Recurse into neosData.node / .children to find a node where identifier == currentNodeIdentifier
  // and return that node

  if (!neosContext.currentNodeIdentifier) {
    return undefined;
  }

  return resolveCurrentNodeRecursive(neosContext.currentNodeIdentifier, neosData.node);
}

export function resolveCurrentNodeRecursive(
  currentNodeIdentifier: string,
  node: NeosContentNode
): NeosContentNode | undefined {
  if (node.identifier === currentNodeIdentifier) {
    return node;
  }

  if (!node.children) {
    return undefined;
  }

  for (const child of node.children) {
    const result = resolveCurrentNodeRecursive(currentNodeIdentifier, child);
    if (result) {
      return result;
    }
  }

  return undefined;
}
