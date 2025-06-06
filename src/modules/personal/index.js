/**
 * PERSONAL MODULE - Entry Point
 */

import React from 'react';
import { moduleConfig } from './module-config.js';

export default function PersonalModule({ activePage }) {

    // Komponente aus der Config finden oder Default nehmen
    let pageConfig = moduleConfig.pages.find(p => p.component === activePage);

    // Fallback: Default aus Config nehmen
    if (!pageConfig) {
        pageConfig = moduleConfig.pages.find(p => p.component === moduleConfig.defaultPage);
    }

    const Component = pageConfig?.reactComponent;

    return Component ? React.createElement(Component) : null;
}