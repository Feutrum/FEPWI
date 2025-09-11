import React, { useState } from 'react';
import { mitarbeiterService } from "@/modules/personal/services/mitarbeiterService";

// --- State für Formularfelder ---
export default function MitarbeiterErstellen() {
    const [form, setForm] = useState({
        name: '',
        birthdate: '',
        adress: '',
        entryDate: '',
        salary: 2000.00,
        workTime: '',
        qualification: '',
        role: ''
    });
    const [message, setMessage] = useState('');

    // Diese Funktion wird ausgeführt, wenn der User ein Formularfeld ändert.
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "salary") {
            setForm(prev => ({
                ...prev,
                salary: parseFloat(value)
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };


    // Wenn der User das Formular absendet, werden die Daten an den Service geschickt und das Formular zurückgesetzt.
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await mitarbeiterService.create(form);
            setMessage('Mitarbeiter erfolgreich angelegt!');
            setForm({
                name: '',
                birthdate: '',
                adress: '',
                entryDate: '',
                salary: 2000.00,
                workTime: '',
                qualification: '',
                role: ''
            });
        } catch (_) {
            setMessage('Fehler beim Anlegen des Mitarbeiters.');
        }
    };

    return (
        <div style={pageLayout}>
            <div style={formContainer}>
                <h2>Neuen Mitarbeiter anlegen</h2>
                <form onSubmit={handleSubmit} style={gridStyle}>
                    <div>
                        <InputField label="Name" name="name" value={form.name} onChange={handleChange} />
                        <InputField label="Geburtsdatum" name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />
                        <InputField label="Adresse" name="adress" value={form.adress} onChange={handleChange} />
                        <InputField label="Eintrittsdatum" name="entryDate" type="date" value={form.entryDate} onChange={handleChange} />
                    </div>
                    <div>
                        <InputField label="Gehalt" name="salary" type="number" value={form.salary} onChange={handleChange} />
                        <InputField label="Arbeitszeiten" name="workTime" value={form.workTime} onChange={handleChange} />
                        <InputField label="Qualifikation" name="qualification" value={form.qualification} onChange={handleChange} />
                        <InputField label="Rolle" name="role" value={form.role} onChange={handleChange} />
                    </div>
                    <button type="submit" style={buttonStyle}>Anlegen</button>
                </form>

                {message && <div style={{ marginTop: "16px" }}>{message}</div>}

                <div style={preStyle}>
                    <pre>{JSON.stringify(form, null, 2)}</pre>
                </div>
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
                required
            />
        </div>
    );
}

// --- Styles ---
const pageLayout = {
    display: "flex",
    justifyContent: "center",
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
};

const formContainer = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
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
    gridColumn: "span 2", // Button über beide Spalten
};

const preStyle = {
    marginTop: "20px",
    padding: "10px",
    background: "#eee",
    borderRadius: "6px",
    overflowX: "auto",
};
