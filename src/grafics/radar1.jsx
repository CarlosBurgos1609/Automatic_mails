import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
// import "./RadarChartComponent.css"; // Importa el CSS

const data = [
  { subject: "Enero", A: 120, fullMark: 150 },
  { subject: "Febrero", A: 98, fullMark: 150 },
  { subject: "Marzo", A: 86, fullMark: 150 },
  { subject: "Abril", A: 99, fullMark: 150 },
  { subject: "Mayo", A: 85, fullMark: 150 },
  { subject: "Junio", A: 65, fullMark: 150 },
];

export default function RadarChartComponent() {
  return (
    <div className="radar-chart-container">
      <h3>Gráfica Radar (Ejemplo)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 150]} />
          <Radar name="A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}