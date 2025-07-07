import React, { useEffect, useState } from 'react';
import './YearSelector.css';
import { yearSelectorService } from '../../services/yearSelectorService';

export default function YearSelector() {
  const [years, setYears] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const result = await yearSelectorService.getYears();
        setYears(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  const toggleOpen = () => setOpen(!open);

  const selectYear = (year) => {
    setSelectedYear(year);
    setOpen(false);
  };

  if (loading) return <div>Lade Erntejahre...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler beim Laden der Jahre</div>;

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
