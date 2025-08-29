import React from "react";
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Desktop", value: 70, fill: "#8884d8" },
  { name: "Mobile", value: 50, fill: "#82ca9d" },
  { name: "Tablet", value: 30, fill: "#ffc658" },
];

export default function RadialChartSimple() {
  return (
    <div className="chart-card">
      <h3>Radial Bar Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={20} data={data}>
          <RadialBar minAngle={15} background clockWise dataKey="value" />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}