export interface NeosData {
  node: NeosContentNode;
  site: NeosNode;
  meta: any;
  backend?: BackendProps;
}

export interface NeosNode {
  identifier: string;
  nodeType: string;
  contextPath: string;
  properties: {
    [key: string]: any;
  };
  label: string;
  depth: number;
  removed: boolean;
  creationDateTime: string;
  lastModificationDateTime: string;
  lastPublicationDateTime: string;
  path: string;
  hidden: boolean;
  hiddenBeforeDateTime: string;
  hiddenAfterDateTime: string;
  parent: string;
  isAutoCreated: boolean;
  matchesCurrentDimensions: boolean;
  isFullyLoaded: boolean;
}

export interface NeosDocumentNode extends NeosNode {
  children?: NeosContentNode[];
}

export interface NeosContentNode extends NeosNode {
  nodeName: string;
  children?: NeosContentNode[];
  backend?: {
    serializedNode: any;
  };
}

export interface BackendProps {
  documentInformation?: any;
}

export type NeosNodeTypes = Record<string, React.FC>;

export interface NeosContextProps {
  node: NeosContentNode;
  documentNode: NeosDocumentNode;
  site: NeosNode;
  meta: any;
  inBackend: boolean;
  nodeTypes: Record<string, any>;
}

export interface DocumentsResponse {
  documents: DocumentsItem[];
}

export interface DocumentsItem {
  identifier: string;
  contextPath: string;
  dimensions: Record<string, string[]>;
  site: string;
  meta: {
    title: string;
  };
  routePath: string;
  renderUrl: string;
}

export interface ApiErrors {
  errors?: { message: string; code: number }[];
}
