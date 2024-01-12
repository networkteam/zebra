import { ContextProps, NeosContentNode, NeosData } from '../../types';

export function resolveCurrentNode(ctx: ContextProps, neosData: NeosData): NeosContentNode | undefined {
  // Recurse into neosData.node / .children to find a node where identifier == currentNodeIdentifier
  // and return that node

  if (!ctx.currentNodeIdentifier) {
    return undefined;
  }

  return resolveCurrentNodeRecursive(ctx.currentNodeIdentifier, neosData.node);
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
