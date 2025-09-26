import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useChartsData from "../hooks/useChartsData";
import { processPieChartData } from "../utils/chartDataProcessors";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export default function PieChartSimple() {
  const { correos, reenvios, habeasCorpus, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="chart-card">
        <h3>Distribución de Datos</h3>
        <div style={{ textAlign: "center", padding: "50px", color: "#003f75" }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <h3>Distribución de Datos</h3>
        <div style={{ textAlign: "center", padding: "50px", color: "#e53935", fontSize: "14px" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const data = processPieChartData(correos, reenvios, habeasCorpus);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="chart-card">
        <h3>Distribución de Datos</h3>
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Distribución General</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} registros`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", marginTop: 12, color: "#888", fontSize: "14px" }}>
        <span style={{ fontWeight: 500 }}>Total registros: {total}</span>
      </div>
    </div>
  );
}
