import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { pieChartService } from '../../services/pieChartService';
import './PieCharts.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PieCharts = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPieCharts = async () => {
      try {
        setLoading(true);
        const data = await pieChartService.getAllPieData();
        setDatasets(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPieCharts();
  }, []);

  if (loading) return <div>Lade Diagramme...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
  if (!datasets || datasets.length === 0) return <div>Keine Diagrammdaten gefunden.</div>;

  return (
    <div className="pie-charts-container">
      {datasets.map((dataset, index) => (
        <div key={index} className="pie-chart-item">
          <h3>{dataset.title}</h3>
          <PieChart width={200} height={200}>
            <Pie
              data={dataset.data}
              cx="50%"
              cy="50%"
              outerRadius={50}
              label
              fill="#8884d8"
              dataKey="value"
            >
              {dataset.data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <ul className="data-list">
            {dataset.data.map((entry, i) => (
              <li key={i}>
                {entry.name}: {entry.value} kg
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PieCharts;
