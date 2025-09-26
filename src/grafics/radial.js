import React from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useChartsData from "../hooks/useChartsData";
import { processRadialChartData } from "../utils/chartDataProcessors";

export default function RadialChartSimple() {
  const { correos, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="chart-card">
        <h3>Estado de Correos</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#003f75' }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <h3>Estado de Correos</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e53935', fontSize: '14px' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const data = processRadialChartData(correos);

  if (data.every(item => item.value === 0)) {
    return (
      <div className="chart-card">
        <h3>Estado de Correos</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          No hay correos registrados
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Estado de Procesamiento</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          barSize={20}
          data={data}
        >
          <RadialBar 
            minAngle={15} 
            background 
            clockWise 
            dataKey="value" 
          />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.percentage}%`}
          />
          <Tooltip 
            formatter={(value, name, props) => [
              `${value} correos (${props.payload.percentage}%)`, 
              name
            ]}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", marginTop: 12, color: "#888", fontSize: "14px" }}>
        <span style={{ fontWeight: 500 }}>
          Total: {data.reduce((sum, item) => sum + item.value, 0)} correos
        </span>
      </div>
    </div>
  );
}
