import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './PieCharts.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Drei Datensätze für die drei Diagramme
const datasets = [
  {
    title: 'Schlagnutzung',
    data: [
      { name: 'Mais', value: 40 },
      { name: 'Weizen', value: 30 },
      { name: 'Gerste', value: 30 },
    ],
  },
  {
    title: 'Lagermenge',
    data: [
      { name: 'X', value: 20 },
      { name: 'Y', value: 50 },
      { name: 'Z', value: 30 },
    ],
  },
  {
    title: 'Aktivitäten',
    data: [
      { name: 'A', value: 60 },
      { name: 'B', value: 20 },
      { name: 'C', value: 20 },
    ],
  },
];

export default function PieCharts() {
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
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={45}
              fill="#8884d8"
              dataKey="value"
            >
              {dataset.data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={COLORS[i % COLORS.length]}
                />
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
}
