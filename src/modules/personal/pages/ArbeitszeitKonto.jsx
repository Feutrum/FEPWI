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
         console.log("", data)
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

  //not needed
  const handlePersonChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (type === "number") {newValue = Number(value);}
    setemployeeFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleTimeAccountChange = (e) => {
    const { type, name, value } = e.target;
    if(type === "number"){
      let newValue = Number(value);
      setworkTimeFormData((prev) => ({...prev, [name]: newValue}));
    }else{console.error('Eingabe ist kein Zahl');}
  }


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
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{i.doneTime}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{i.doneTime - i.expectedTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

  </div>);
}