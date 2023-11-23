import ContentComponentProvider from './ContentComponentProvider';

type ContentComponentProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  [x: string]: any;
};

const ContentComponent = async ({ as = 'div', children, ...rest }: ContentComponentProps) => {
  const Component = as;

  return (
    <ContentComponentProvider>
      {({ componentProps, includes }) => (
        <Component {...componentProps} {...rest}>
          {children}
          {includes}
        </Component>
      )}
    </ContentComponentProvider>
  );
};

export default ContentComponent;
