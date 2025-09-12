import {useEffect, useState} from "react";
import {mitarbeiterService} from "@/modules/personal/services/mitarbeiterService";
import {workTimeAccountService} from "@/modules/personal/services/workTimeAccountService";

export default function ArbeitszeitKonto(){

  const [selectedId, setSelectedId] = useState("");
  const [employeeFormData, setemployeeFormData] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [workTimeSheets, setworkTimeSheets] = useState([]);
  const [workTimeFormData, setworkTimeFormData] = useState(null);
  const [employeeSheets, setEmployeeSheets] = useState([]);


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await mitarbeiterService.getAll();
        setEmployees(data);
      }
      catch (err) {
        console.error('Fehler beim Laden der Mitarbeiter:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadAccData = async () => {
      try {
        const data = await workTimeAccountService.getAll();
        setworkTimeSheets(data);
       
      }
      catch (err) {
        console.error('Fehler beim Laden der Mitarbeiter:', err);
      }
    };
    loadAccData();
  }, []);

  const handlePersonSelect = (id) => {
    setSelectedId(id);
    const person = employees.find((e) => e.id === Number(id));
    if (person) setemployeeFormData({ ...person });
    setEmployeeSheets(workTimeSheets.filter(filteredSheet => filteredSheet.workerID === Number(id)));

  };

  const handleSave = () => {
    //hier service save request
    //hier differenz setzen und einspeichern
  };

  const handleDoneTimeChange = (id,value) => {
    const newSheets = employeeSheets.map(m => {
      if (m.id ===id) {
        return{...m, doneTime: Number(value)};
      }
      return m;
    });
    setEmployeeSheets(newSheets);
  };

  const addExtraWeek = () => {
    if(!selectedId) return;
    const currentWeeks = employeeSheets.map(m => m.calendarWeek);
    const maxWeek = currentWeeks.length>0 ? Math.max(...currentWeeks):0;
    const newWeek = {
      id: -Date.now(),
      workerID: Number(selectedId),
      calendarWeek: maxWeek+1,
      expectedTime: employeeFormData.workTime ??0,
      doneTime: 0
    };
    setEmployeeSheets([...employeeSheets, newWeek])
  };


return (<div style={{ padding: '20px' }}>
  <h1>Arbeitszeitkonto</h1>
  <select
    value={selectedId}
    onChange={(e) => handlePersonSelect(e.target.value)}
    style={{padding:'10px 15px', fontSize:'16px'}}>
    <option value="" disabled>
      Mitarbeiter auswählen
    </option>
    {employees.map((person) => (
      <option key={person.id} value={person.id}>
        {person.name}
      </option>
    ))}
  </select>
  {employeeSheets.length > 0 && (
    <div style={{ 
      marginTop: '20px', 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: '40px' 
    }}>
      <div style={{ flex: 1 }}>
        <h2>Arbeitszeiteinträge</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={thStyle}>Kalendarwoche</th>
              <th style={thStyle}>erwartete Arbeitszeit</th>
              <th style={thStyle}>erbrachte Arbeitszeit</th>
              <th style={thStyle}>Differenz</th>
              <th style={thStyle}>Gesamtdifferenz</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const sortedSheets = [...employeeSheets].sort((a,b)=>b.calendarWeek-a.calendarWeek);
              const diffs = sortedSheets.map(i=>i.doneTime-i.expectedTime);
              let diffSum = 0; 
              const sumDiffs = new Array(diffs.length);
              for(let i=diffs.length-1;i>=0;i--){
                diffSum += diffs[i];
                sumDiffs[i] = diffSum;
              }
              
              return sortedSheets.map((i, idx) => (
                <tr key={i.id}>
                  <td style={tdStyle}>{i.calendarWeek}</td>
                  <td style={tdStyle}>{i.expectedTime}</td>
                  <td>
                    <input
                      type="number"
                      value={i.doneTime}
                      onChange={(e) => handleDoneTimeChange(i.id, e.target.value)}
                      style={tdStyle}
                    />
                  </td>
                  <td style={tdStyle}>{diffs[idx]}</td>
                  <td style={tdStyle}>{sumDiffs[idx]}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    {selectedId && (
      <div style={{
        marginTop: '76px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: '180px',
      }}>
        <button onClick={handleSave} style={buttonStyle}>
          Speichern
        </button>
        <button onClick={addExtraWeek} style={buttonStyle}>
          neue Woche hinzufügen
        </button>
      </div>
    )}
  </div>
)}


</div>);
}

const thStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  background: '#f2f2f2',
  textAlign: 'left'
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center'
};

const buttonStyle = {
  padding: "12px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#1976d2",
  color: "white",
  cursor: "pointer",
};
