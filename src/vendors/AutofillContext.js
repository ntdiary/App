import React from 'react';
import AutofillManager from './AutofillManager';

export default React.createContext(
    new AutofillManager(false),
);
