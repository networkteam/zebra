import { ContextProps } from '../../types';
import { withEditPreviewMode, withNode } from '../utils/hooks';

type EditableProps = {
  ctx: ContextProps;
  as?: keyof JSX.IntrinsicElements;
  property: string;
  [x: string]: any;
};

const Editable = async ({ ctx, as = 'div', property, ...rest }: EditableProps) => {
  const inBackend = ctx.inBackend;

  const node = await withNode(ctx);
  const editPreviewMode = await withEditPreviewMode(ctx);

  if (!node) {
    return null;
  }

  const { contextPath, nodeType, properties, backend } = node;
  const { className, ...restAttributes } = rest;
  const Component = as;

  if (!inBackend || editPreviewMode?.isEdit === false) {
    return <Component {...rest} dangerouslySetInnerHTML={{ __html: properties[property] || '' }} />;
  }

  return (
    <Component
      className={`neos-inline-editable ${className}`}
      data-__neos-property={property}
      data-__neos-editable-node-contextpath={contextPath}
      data-__neos-node-contextpath={contextPath}
      property={'typo3:' + property}
      data-neos-node-type={nodeType}
      contentEditable
      dangerouslySetInnerHTML={{
        // Use the actual content from the backend metadata if available to preserve original node and asset URIs
        __html: backend?.serializedNode?.properties[property] || properties[property] || '',
      }}
      {...restAttributes}
    />
  );
};

export default Editable;
