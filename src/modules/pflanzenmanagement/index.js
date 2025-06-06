/**
 * PFLANZENMANAGEMENT MODULE - Entry Point
 */

import React from 'react';
import { moduleConfig } from './module-config.js';

export default function PflanzenmanagementModule({ activePage }) {

    // Komponente aus der Config finden
    const pageConfig = moduleConfig.pages.find(p => p.component === activePage);
    const Component = pageConfig?.reactComponent;

    if (Component) {
        return React.createElement(Component);
    }

    // Fallback: Default Page (KalenderAktivitaeten)
    const defaultPageConfig = moduleConfig.pages.find(p => p.component === moduleConfig.defaultPage);
    const DefaultComponent = defaultPageConfig?.reactComponent;

    if (DefaultComponent) {
        return React.createElement(DefaultComponent);
    }

    // Letzter Fallback falls Config kaputt ist
    return React.createElement('div', {}, 'Fehler beim Laden der Seite');
}