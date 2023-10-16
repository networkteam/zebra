import { createServerContext } from 'react';

import { NeosServerContextProps } from '../../types';

export const NeosServerContext = createServerContext<NeosServerContextProps>('neosDataContext', {});
