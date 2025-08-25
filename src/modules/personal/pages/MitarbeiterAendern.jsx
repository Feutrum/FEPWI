import {useEffect, useState} from "react";
import {mitarbeiterService} from "@/modules/personal/services/mitarbeiterService";


export default function EmployeeForm() {
  const [employees, setMitarbeiter] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await mitarbeiterService.getAll(); // API-Aufruf
        setMitarbeiter(data);
      } catch (err) {
        console.error('Fehler beim Laden der Mitarbeiter:', err);
      }
    };
    loadData();
  }, []);

  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState(null);
  const [savedData, setSavedData] = useState([]);

  // Mitarbeiter aus Dropdown auswählen → Daten in Formular übernehmen
  const handleSelect = (id) => {
    setSelectedId(id);
    const person = employees.find((e) => e.id === Number(id));
    if (person) setFormData({ ...person });
  };

  // Eingaben speichern
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // wenn number-Feld → Zahl speichern
    const newValue = type === "number" ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // speichern
  const handleSave = () => {
    if (formData) {
      const entry = { ...formData, savedAt: new Date().toLocaleString() };
      setSavedData((prev) => [...prev, entry]);
      console.log("Gespeichert:", entry);
    }
  };

  return (
    <div style={pageLayout}>
      {/* Linke Seite: Formular */}
      <div style={formContainer}>
        <div style={headerStyle}>
          <h2>Personalverwaltung</h2>
          <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            style={selectStyle}
          >
            <option value="" disabled>
              Mitarbeiter auswählen …
            </option>
            {employees.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        {formData && (
          <div style={gridStyle}>
            <div>
              <InputField label="Name" name="name" value={formData.name} onChange={handleChange} />
              <InputField
                label="Geburtsdatum"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
              />
              <InputField label="Adresse" name="address" value={formData.address} onChange={handleChange} />
              <InputField
                label="Eintrittsdatum"
                name="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <InputField
                label="Gehalt (€)"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
              />
              <InputField
                label="Arbeitsstunden pro Woche"
                name="workingHours" 
                type="number"
                value={formData.workingHours}
                onChange={handleChange}
              />
              <InputField label="Qualifikation" name="qualification" value={formData.qualification} onChange={handleChange} />
              <InputField label="Rolle" name="role" value={formData.role} onChange={handleChange} />
            </div>
          </div>
        )}

        {formData && (
          <button onClick={handleSave} style={buttonStyle}>
            Speichern
          </button>
        )}

        {savedData.length > 0 && (
          <pre style={preStyle}>{JSON.stringify(savedData, null, 2)}</pre>
        )}


      </div>

      {/* Rechte Seite: History */}
      <div style={historyContainer}>
        <h3>Änderungshistorie</h3>
        {savedData.length === 0 && <p>Noch keine Änderungen gespeichert.</p>}
        <ul style={historyList}>
          {savedData.map((entry, idx) => (
            <li key={idx} style={historyItem}>
              <strong>{entry.name}</strong> – {entry.role}, {entry.salary} €
              <br />
              <span style={{ fontSize: "12px", color: "#555" }}>
                gespeichert am: {entry.savedAt}
              </span>
            </li>
          ))}
        </ul>


      </div>
    </div>
  );
}

// --- Hilfskomponente ---
function InputField({ label, name, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
}

// --- Styles ---
const pageLayout = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr", // vorher 2fr 1fr -> so ist aber kleiner damit nix abgeschnitten ist. (1.3fr 1 ist etwas zu klein / manche inputs sind abgeschnitten)
  gap: "20px",
  maxWidth: "1200px",
  margin: "20px auto",
  padding: "20px",
};

const formContainer = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const historyContainer = {
  background: "#f9f9f9",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  overflowY: "auto",
  maxHeight: "80vh",
};

const headerStyle = {
  marginBottom: "20px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "15px",
};

const buttonStyle = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#1976d2",
  color: "white",
  cursor: "pointer",
};

const selectStyle = {
  width: "60%",
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const historyList = {
  listStyle: "none",
  padding: 0,
};

const historyItem = {
  marginBottom: "15px",
  padding: "10px",
  background: "#fff",
  borderRadius: "6px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const preStyle = {
  marginTop: "20px",
  padding: "10px",
  background: "#eee",
  borderRadius: "6px",
  overflowX: "auto",
}