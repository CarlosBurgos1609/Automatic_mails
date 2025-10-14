import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaChartPie } from "react-icons/fa";
import useChartsData from "../hooks/useChartsData";
import { processPieChartDataNew } from "../utils/chartDataProcessors";
import { useChartsContext } from "../contexts/ChartsContext";

const COLORS = ["#003f75", "#bafaba"];

export default function PieChartSimple() {
  const { timeFilter, filterType, currentFilterLabel } = useChartsContext();
  const { habeasCorpus, reenvios, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="chart-card">
        <h3>Habeas Corpus vs Reenvíos</h3>
        <div style={{ textAlign: "center", padding: "50px", color: "#003f75" }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <h3>Habeas Corpus vs Reenvíos</h3>
        <div style={{ textAlign: "center", padding: "50px", color: "#e53935", fontSize: "14px" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  // ✅ FILTRAR DATOS SEGÚN EL CONTEXTO GLOBAL CON CORRECCIÓN DE FECHA
  const filterData = (dataArray, dateField = 'created_at') => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
    
    const now = new Date();
    let cutoffDate;
    
    if (filterType === 'days') {
      cutoffDate = new Date(now.getTime() - (timeFilter * 24 * 60 * 60 * 1000));
    } else if (filterType === 'months') {
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - timeFilter, now.getDate());
    } else if (filterType === 'years') {
      cutoffDate = new Date(now.getFullYear() - timeFilter, now.getMonth(), now.getDate());
    }
    
    return dataArray.filter(item => {
      const itemDate = new Date(item[dateField] || item.created_at || item.forward_date || item.fecha || item.date);
      // ✅ CORREGIR DESFASE: Agregar un día para comparar correctamente
      itemDate.setDate(itemDate.getDate() + 1);
      return itemDate >= cutoffDate;
    });
  };

  const filteredHabeasCorpus = filterData(habeasCorpus, 'created_at');
  const filteredReenvios = filterData(reenvios, 'forward_date');

  // ✅ USAR LA NUEVA FUNCIÓN PARA PIE CHART
  const data = processPieChartDataNew(filteredHabeasCorpus, filteredReenvios);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="chart-card">
        <h3>Habeas Corpus vs Reenvíos</h3>
        <div style={{ 
          textAlign: "center", 
          padding: "20px", 
          color: "#666",
          fontSize: "14px" 
        }}>
          <div style={{ marginBottom: '8px' }}>No hay datos para:</div>
          <div style={{ fontWeight: 'bold', color: '#003f75' }}>{currentFilterLabel}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Habeas Corpus vs Reenvíos</h3>
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '12px', 
        fontSize: '12px', 
        color: '#666',
        fontStyle: 'italic',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <FaChartPie style={{ color: '#003f75', fontSize: '14px' }} />
        <span>{currentFilterLabel}</span>
      </div>
      
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
        <span style={{ fontWeight: 500 }}>Total registros: {total.toLocaleString()}</span>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Período: {currentFilterLabel}
        </div>
      </div>
    </div>
  );
}
