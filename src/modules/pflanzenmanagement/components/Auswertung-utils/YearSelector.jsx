import React, { useState } from 'react';
import './YearSelector.css';

export default function YearSelector() {
  const years = [2025, 2024, 2023, 2022, 2021, 2020];
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  const toggleOpen = () => setOpen(!open);

  const selectYear = (year) => {
    setSelectedYear(year);
    setOpen(false);
  };

  return (
    <div className="dropdown-container">
      <button onClick={toggleOpen} className="dropdown-button">
        {selectedYear ? `Erntejahr: ${selectedYear}` : 'Erntejahr auswählen'}
      </button>

      {open && (
        <ul className="dropdown-list">
          {years.map((year) => (
            <li
              key={year}
              className="dropdown-list-item"
              onClick={() => selectYear(year)}
            >
              {year}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

