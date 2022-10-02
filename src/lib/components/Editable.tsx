import classNames from 'classnames';

import { useInBackend, useNode } from '../../utils/hooks';

type EditableProps = {
  as?: keyof JSX.IntrinsicElements;
  property: string;
  [x: string]: any;
};

export default function Editable({ as = 'div', property, ...rest }: EditableProps) {
  const { properties, nodeType, contextPath } = useNode();
  const inBackend = useInBackend();
  const { className, ...restAttributes } = rest;
  const Component = as;

  return (
    <Component
      className={classNames(className, {
        'neos-inline-editable': inBackend,
      })}
      data-__neos-property={inBackend ? property : undefined}
      data-__neos-editable-node-contextpath={inBackend ? contextPath : undefined}
      data-__neos-node-contextpath={inBackend ? contextPath : undefined}
      property={inBackend ? 'typo3:' + property : undefined}
      data-neos-node-type={inBackend ? nodeType : undefined}
      contentEditable={inBackend ? true : undefined}
      dangerouslySetInnerHTML={{ __html: properties[property] }}
      {...restAttributes}
    />
  );
}
