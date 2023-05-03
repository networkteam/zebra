import classNames from 'classnames';

import { useEditPreviewMode, useInBackend, useNode } from '../../utils/hooks';

type EditableProps = {
  as?: keyof JSX.IntrinsicElements;
  property: string;
  [x: string]: any;
};

export default function Editable({ as = 'div', property, ...rest }: EditableProps) {
  const { properties, nodeType, contextPath } = useNode();
  const inBackend = useInBackend();
  const editPreviewMode = useEditPreviewMode();
  const { className, ...restAttributes } = rest;
  const Component = as;

  if (!inBackend || editPreviewMode?.isEdit === false) {
    return <Component {...rest} dangerouslySetInnerHTML={{ __html: properties[property] }} />;
  }

  return (
    <Component
      className={classNames(className, 'neos-inline-editable')}
      data-__neos-property={property}
      data-__neos-editable-node-contextpath={contextPath}
      data-__neos-node-contextpath={contextPath}
      property={'typo3:' + property}
      data-neos-node-type={nodeType}
      contentEditable
      dangerouslySetInnerHTML={{ __html: properties[property] }}
      {...restAttributes}
    />
  );
}
