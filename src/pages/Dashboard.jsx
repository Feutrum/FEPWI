
import React, { useState } from 'react';
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../contexts/AuthContext";

// Module Imports
import PflanzenmanagementModule from '../modules/pflanzenmanagement';
import FuhrparkModule from '../modules/fuhrpark';
import LagerhaltungModule from '../modules/lagerhaltung';
import PersonalModule from '../modules/personal';
import VertriebModule from '../modules/vertrieb';

export default function Dashboard() {
    const { user, logout } = useAuth();

    // State für aktives Modul
    const [activeModule, setActiveModule] = useState(null);
    // NEU: State für aktive Page innerhalb des Moduls
    const [activePage, setActivePage] = useState(null);

    // Handler für Header Navigation
    const handleModuleChange = (moduleName) => {
        setActiveModule(moduleName);
        setActivePage(null); // Reset page when module changes
    };

    // Handler für Page-Wechsel in Sidebar
    const handlePageChange = (pageName) => {
        console.log('Page changed to:', pageName);
        setActivePage(pageName);
    };

    // Module zu Component Mapping
    const renderActiveModule = () => {
        switch(activeModule) {
            case 'pflanzenmanagement':
                return <PflanzenmanagementModule activePage={activePage} />;
            case 'fuhrpark':
                return <FuhrparkModule activePage={activePage} />;
            case 'lagerhaltung':
                return <LagerhaltungModule activePage={activePage} />;
            case 'personal':
                return <PersonalModule activePage={activePage} />;
            case 'vertrieb':
                return <VertriebModule activePage={activePage} />;
            default:
                return (
                    <div>
                        <h2>Willkommen im Dashboard</h2>
                        <p>Wählen Sie ein Modul aus der Navigation oben.</p>
                    </div>
                );
        }
    };




    return (
        <MainLayout
            showFullHeader={true}
            user={user}
            onLogout={logout}
            onModuleChange={handleModuleChange}
            activeModule={activeModule}
            onPageChange={handlePageChange}  // NEU: Page-Handler weiterleiten
        >
            {renderActiveModule()}
        </MainLayout>
    );
}