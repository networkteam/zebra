import { useEditPreviewMode, useInBackend, useNode } from '../../utils/hooks';

type EditableProps = {
  as?: keyof JSX.IntrinsicElements;
  property: string;
  [x: string]: any;
};

export default function Editable({ as = 'div', property, ...rest }: EditableProps) {
  const { properties, nodeType, contextPath, backend } = useNode();
  const inBackend = useInBackend();
  const editPreviewMode = useEditPreviewMode();
  const { className, ...restAttributes } = rest;
  const Component = as;

  if (!inBackend || editPreviewMode?.isEdit === false) {
    return <Component {...rest} dangerouslySetInnerHTML={{ __html: properties[property] }} />;
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
}
