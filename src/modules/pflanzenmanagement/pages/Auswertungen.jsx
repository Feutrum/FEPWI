import React from 'react';
import YearSelector from '../components/auswertung-utils/YearSelector';
import Kopfzeile2 from '../components/auswertung-utils/Kopfzeile2';  
import PieCharts from '../components/auswertung-utils/PieCharts';

function App() {
  const anbauDaten = {
    erntejahr: '',
    schlaege: '',
    ha: '',
    maschinen: '',
    lager: '',
    arbeiter: '',
  };

  return (
    <div className="auswertung-wrapper">
      <h1>Auswertung der Erntejahre</h1>
      <YearSelector />

      <div className="kopfzeile-wrapper">
        <Kopfzeile2 data={anbauDaten} />
      </div>

      <div className="piecharts-wrapper">
        <PieCharts />
      </div>
    </div>
  );
}

export default App;

