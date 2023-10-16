import { useEditPreviewMode, useInBackend, useNode } from '../utils/hooks';

type EditableProps = {
  as?: keyof JSX.IntrinsicElements;
  property: string;
  [x: string]: any;
};

const Editable = async ({ as = 'div', property, ...rest }: EditableProps) => {
  const inBackend = useInBackend();
  const loadNode = useNode();
  const loadEditPreviewMode = useEditPreviewMode();

  const node = await loadNode();
  const editPreviewMode = await loadEditPreviewMode();

  if (!node) {
    return null;
  }

  const { contextPath, nodeType, properties } = node;
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
      dangerouslySetInnerHTML={{ __html: properties[property] || '' }}
      {...restAttributes}
    />
  );
};

export default Editable;
