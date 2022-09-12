import { createContext } from 'react';

import { NeosContextProps } from '../types';

const NeosContext = createContext<NeosContextProps | null>(null);

export default NeosContext;
