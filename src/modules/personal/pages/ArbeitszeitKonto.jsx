import {useEffect, useState} from "react";
import {mitarbeiterService} from "@/modules/personal/services/mitarbeiterService";

export default function ArbeitszeitKonto(){

    const [selectedId, setSelectedId] = useState("");
    const [formData, setFormData] = useState(null);
    const [savedData, setSavedData] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await mitarbeiterService.getAll();
                setEmployees(data);
            } catch (err) {
                console.error('Fehler beim Laden der Mitarbeiter:', err);
            }
        };
        loadData();
    }, []);


    const handleSelect = (id) => {
        setSelectedId(id);
        const person = employees.find((e) => e.id === Number(id));
        if (person) setFormData({ ...person });
    };

    const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (type === "number") {
      newValue = Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };


    return (<div style={{ padding: '20px' }}>
            <h1>Arbeitszeitkonto</h1>
            <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            >
            <option value="" disabled>
              Mitarbeiter auswählen
            </option>
            {employees.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>

            {formData && (
                <table style={{ marginTop: '20px', borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Name</th>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formData.name}</td>
                    </tr>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Arbeitsstunden pro Woche</th>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formData.workTime}</td>
                    </tr>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>bisher erbracht</th>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formData.workTime}</td>
                    </tr>
                </tbody>
                </table>
            )}


        </div>);
}