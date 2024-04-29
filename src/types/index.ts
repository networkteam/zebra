import { FC } from 'react';

declare global {
  interface Document {
    __isInitialized?: boolean;
  }
}

export type DocumentResult = NeosData | RedirectData;

export interface NeosData {
  node: NeosContentNode;
  site: NeosNode;
  meta: any;
  backend?: BackendProps;
}

export interface RedirectData {
  redirect: {
    targetPath: string;
    statusCode: number;
  };
}

export type SiteData = {
  site: {
    content: Record<string, any>;
    meta: {
      title: string;
      nodeType: string;
      nodeName: string;
    };
  };
};

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

export interface BackendInclude {
  key: string;
  type: 'script' | 'link';
  content?: string;
  src?: string;
  href?: string;
  rel?: string;
}

export interface BackendProps {
  documentInformation?: any;
  editPreviewMode?: BackendEditPreviewMode;
  guestFrameApplication?: BackendInclude[];
  routePath?: string;
}

export interface BackendEditPreviewMode {
  name: string;
  isPreview: boolean;
  isEdit: boolean;
  options: Record<string, any> | null;
}

export type NeosNodeTypes = Record<string, FC<{ ctx: ContextProps }>>;

export interface NeosContextProps {
  node: NeosContentNode;
  documentNode: NeosDocumentNode;
  site: NeosNode;
  meta: any;
  nodeTypes: Record<string, any>;
  inBackend: boolean;
  editPreviewMode?: BackendEditPreviewMode;
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
  creationDateTime: string;
  lastPublicationDateTime?: string;
}

export interface ApiErrors {
  errors?: { message: string; code: number }[];
}

export type ContextProps = {
  routePath?: string;
  contextNodePath?: string;
  inBackend?: boolean;
  documentNodeIdentifier?: string;
  currentNodeIdentifier?: string;
  dataLoaderOptions?: DataLoaderOptions;
};

export type DataLoaderOptions = {
  /**
   * The fetch request cache mode to use.
   */
  cache?: RequestCache;

  /**
   * The Next fetch request config for revalidation and tags.
   */
  next?: NextFetchRequestConfig;
};

export type OptionalOption = {
  /**
   * If true, the data loader will not throw an error if the content API base URL is not set and no data can be fetched.
   */
  optional?: boolean;
};
