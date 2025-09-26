import React from "react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import useChartsData from "../hooks/useChartsData";
import { processRadarChartData } from "../utils/chartDataProcessors";

export default function RadarChartComponent() {
  const { habeasCorpus, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="radar-chart-container">
        <h3>Habeas Corpus por Juzgado</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#003f75' }}>
          Cargando datos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="radar-chart-container">
        <h3>Habeas Corpus por Juzgado</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e53935', fontSize: '14px' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const data = processRadarChartData(habeasCorpus);

  if (data.length === 0) {
    return (
      <div className="radar-chart-container">
        <h3>Habeas Corpus por Juzgado</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          No hay datos disponibles
        </div>
      </div>
    );
  }

  // Calcular el dominio máximo para el radar
  const maxValue = Math.max(...data.map(item => item.A), 0);
  const domain = maxValue > 0 ? [0, Math.ceil(maxValue * 1.2)] : [0, 10];

  return (
    <div className="radar-chart-container">
      <h3>Habeas Corpus por Juzgado</h3>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 8, fontSize: "14px" }}>
        Top {data.length} juzgados con más casos
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={domain}
            tick={{ fontSize: 10, fill: '#666' }}
            tickCount={6}
          />
          <Radar 
            name="Casos de Habeas Corpus" 
            dataKey="A" 
            stroke="#8884d8" 
            fill="#8884d8" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            formatter={(value, name) => [`${value} casos`, name]}
            labelFormatter={(label) => `Juzgado: ${label}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", marginTop: 12, color: "#888", fontSize: "14px" }}>
        <span style={{ fontWeight: 500 }}>
          Total casos: {data.reduce((sum, item) => sum + item.A, 0)}
        </span>
      </div>
    </div>
  );
}