import React from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useChartsData from "../hooks/useChartsData";
import { processRadialChartDataNew } from "../utils/chartDataProcessors";
import { useChartsContext } from "../contexts/ChartsContext";

export default function RadialChartSimple() {
  const { timeFilter, filterType, currentFilterLabel } = useChartsContext();
  const { habeasCorpus, reenvios, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="chart-card">
        <h3>Estado de Habeas Corpus y Reenvíos</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#003f75' }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <h3>Estado de Habeas Corpus y Reenvíos</h3>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e53935', fontSize: '14px' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  // ✅ FILTRAR DATOS SEGÚN EL CONTEXTO GLOBAL
  const filterData = (dataArray) => {
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
      const itemDate = new Date(item.created_at || item.fecha || item.forward_date);
      return itemDate >= cutoffDate;
    });
  };

  const filteredHabeasCorpus = filterData(habeasCorpus);
  const filteredReenvios = filterData(reenvios);

  // ✅ USAR LA NUEVA FUNCIÓN PARA RADIAL CHART
  const data = processRadialChartDataNew(filteredHabeasCorpus, filteredReenvios);

  if (data.every(item => item.value === 0)) {
    return (
      <div className="chart-card">
        <h3>Estado de Habeas Corpus y Reenvíos</h3>
        <div style={{ 
          textAlign: 'center', 
          padding: '30px', 
          color: '#666',
          fontSize: '14px' 
        }}>
          <div style={{ marginBottom: '8px' }}>No hay datos registrados en:</div>
          <div style={{ fontWeight: 'bold', color: '#003f75' }}>{currentFilterLabel}</div>
        </div>
      </div>
    );
  }

  const totalItems = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card">
      <h3>Estado de Habeas Corpus y Reenvíos</h3>
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '12px', 
        fontSize: '12px', 
        color: '#666',
        fontStyle: 'italic'
      }}>
        📊 {currentFilterLabel}
      </div>
      
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
              `${value} registros (${props.payload.percentage}%)`, 
              name
            ]}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div style={{ textAlign: "center", marginTop: 12, color: "#888", fontSize: "14px" }}>
        <span style={{ fontWeight: 500 }}>
          Total: {totalItems.toLocaleString()} registros
        </span>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Período: {currentFilterLabel}
        </div>
      </div>
    </div>
  );
}
