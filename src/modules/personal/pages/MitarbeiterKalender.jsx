import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {mitarbeiterService} from "@/modules/personal/services/mitarbeiterService";

export default function MitarbeiterKalender() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(null);
  const [entries, setEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", eintrag: "" });

  const today = dayjs();

  // Mitarbeiter aus API laden
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await mitarbeiterService.getAll();
        setEmployees(data);
      } catch (err) {
        console.error("Fehler beim Laden der Mitarbeiter:", err);
      }
    };
    loadData();
  }, []);

  // Kalender vorbereiten
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  while (calendarDays.length < 42) calendarDays.push(null);

  // Speichern / Edit
  const handleSaveEntry = () => {
    if (!selectedDay || !selectedEmployee || !formData.name) return;

    if (formData.id) {
      // Edit
      setEntries(
        entries.map((e) => (e.id === formData.id ? { ...formData, date: selectedDay.toDate(), person: selectedEmployee } : e))
      );
    } else {
      // Neu
      const newEntry = {
        id: Date.now(),
        name: formData.name,
        date: selectedDay.toDate(),
        eintrag: formData.eintrag,
        person: selectedEmployee,
      };
      setEntries([...entries, newEntry]);
    }

    setShowForm(false);
    setFormData({ id: null, name: "", eintrag: "" });
  };

  // Löschen
  const handleDelete = (id) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  // Edit vorbereiten
  const handleEdit = (entry) => {
    setFormData(entry);
    setSelectedEmployee(entry.person);
    setSelectedDay(dayjs(entry.date));
    setShowForm(true);
  };

  return (
    <div className="kalender-container">
      {/* Mitarbeiter + Buttons */}
      <div className="toolbar">
        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
          <option value="">Mitarbeiter auswählen…</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.name}>
              {emp.name}
            </option>
          ))}
        </select>
        <button onClick={() => setShowForm(true)} disabled={!selectedDay}>
          Add
        </button>
      </div>

      {/* Navigation */}
      <div className="kalender-nav">
        <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>◀</button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>▶</button>
      </div>

      {/* Kalender */}
      <div className="kalender-grid">
        {["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"].map((day) => (
          <div key={day} className="kalender-header">
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const dateObj = day ? currentDate.date(day) : null;
          const isToday =
            day &&
            currentDate.month() === today.month() &&
            currentDate.year() === today.year() &&
            day === today.date();

          const isSelected = dateObj && selectedDay && dateObj.isSame(selectedDay, "day");

          const dayEntries = entries.filter(
            (e) =>
              dateObj &&
              dayjs(e.date).isSame(dateObj, "day") &&
              (!selectedEmployee || e.person === selectedEmployee) //nur ausgewählte Person
          );

          return (
            <div
              key={i}
              onClick={() => dateObj && setSelectedDay(dateObj)}
              className={`kalender-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
            >
              <div className="day-number">{day}</div>
              {dayEntries.map((entry) => (
                <div key={entry.id} className="entry">
                  <span>{entry.name}</span>
                  <div className="entry-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}>✎</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Popup-Formular */}
      {showForm && (
        <div className="modal">
          <h3>{formData.id ? "Eintrag bearbeiten" : "Neuer Eintrag"}</h3>
          <input
            type="text"
            placeholder="Titel"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <textarea
            placeholder="Beschreibung"
            value={formData.eintrag}
            onChange={(e) => setFormData({ ...formData, eintrag: e.target.value })}
          />
          <div className="modal-actions">
            <button onClick={handleSaveEntry}>{formData.id ? "Update" : "Speichern"}</button>
            <button onClick={() => setShowForm(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .kalender-container {
          max-width: 1200px;
          margin: auto;
          font-family: sans-serif;
          padding: 20px;
        }
        .toolbar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .toolbar select, .toolbar button {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .kalender-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .kalender-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .kalender-header {
          font-weight: bold;
          text-align: center;
          padding: 10px;
          background: #f3f3f3;
          border-radius: 6px;
        }
        .kalender-cell {
          min-height: 150px; /* vorher 120px */
          min-width : 150px;
          background: white;
          border-radius: 8px;
          padding: 10px; /* vorher 6px */
          position: relative;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);  
        }
        .kalender-cell.today {
          border: 2px solid red;
          background: #ffe5e5;
        }
        .kalender-cell.selected {
          border: 2px solid blue;
          background: #e5f0ff;
        }
        .day-number {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .entry {
          background: #90ee90;
          border-radius: 4px;
          padding: 2px 4px;
          margin-top: 2px;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .entry-actions button {
          background: none;
          border: none;
          cursor: pointer;
          margin-left: 4px;
        }
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          z-index: 1000;
          width: 300px;
        }
        .modal input, .modal textarea {
          width: 100%;
          margin-bottom: 10px;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}
