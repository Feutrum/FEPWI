import React from 'react';
import AnbauTabelle from '../components/anbauuebersicht-utils/AnbauTabelle';
import AnbauTabelle2 from '../components/anbauuebersicht-utils/AnbauTabelle2';

export default function AnbauUebersicht() {
    return (
        <div style={{ padding: '20px' }}>
            <p>Anbau übersicht für einen speziellen Schlag</p>
            <AnbauTabelle />
            <AnbauTabelle2 />
        </div>
    );
}