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
      onChange={(e) => handlePersonSelect(e.target.value)}>
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
  <div style={{ marginTop: '20px' }}>
    <h2>Arbeitszeiteinträge</h2>
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Kalendarwoche</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>erwartete Arbeitszeit</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>erbrachte Arbeitszeit</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>differenz</th>
        </tr>
      </thead>
      <tbody>
        {employeeSheets.map((i) => (
          <tr key={i.id}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{i.calendarWeek}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{i.expectedTime}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              <input
                type="number"
                value={i.doneTime}
                name="doneTime"
                onChange={(e) => handleDoneTimeChange(i.id,e.target.value)}
                style={{ width: '100%' }}
              />
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{i.doneTime - i.expectedTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )}
   <button onClick={handleSave}>
      Speichern
    </button>
    <button onClick={addExtraWeek}>
      neue Woche hinzufügen
    </button> 
</div>);
}