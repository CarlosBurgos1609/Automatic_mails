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
import { useChartsContext } from "../contexts/ChartsContext";

export default function RadarChartComponent() {
  const { timeFilter, filterType, currentFilterLabel } = useChartsContext();
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

  // ✅ FILTRAR HABEAS CORPUS SEGÚN EL CONTEXTO GLOBAL
  const filterHabeasCorpus = (habeasArray) => {
    if (!Array.isArray(habeasArray) || habeasArray.length === 0) return [];
    
    const now = new Date();
    let cutoffDate;
    
    if (filterType === 'days') {
      cutoffDate = new Date(now.getTime() - (timeFilter * 24 * 60 * 60 * 1000));
    } else if (filterType === 'months') {
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - timeFilter, now.getDate());
    } else if (filterType === 'years') {
      cutoffDate = new Date(now.getFullYear() - timeFilter, now.getMonth(), now.getDate());
    }
    
    return habeasArray.filter(habeas => {
      const habeasDate = new Date(habeas.created_at || habeas.fecha);
      return habeasDate >= cutoffDate;
    });
  };

  const filteredHabeasCorpus = filterHabeasCorpus(habeasCorpus);
  const data = processRadarChartData(filteredHabeasCorpus);

  if (data.length === 0) {
    return (
      <div className="radar-chart-container">
        <h3>Habeas Corpus por Juzgado</h3>
        <div style={{ 
          textAlign: 'center', 
          padding: '30px', 
          color: '#666',
          fontSize: '14px' 
        }}>
          <div style={{ marginBottom: '8px' }}>No hay datos disponibles en:</div>
          <div style={{ fontWeight: 'bold', color: '#003f75' }}>{currentFilterLabel}</div>
        </div>
      </div>
    );
  }

  // Calcular el dominio máximo para el radar
  const maxValue = Math.max(...data.map(item => item.A), 0);
  const domain = maxValue > 0 ? [0, Math.ceil(maxValue * 1.2)] : [0, 10];
  const totalCasos = data.reduce((sum, item) => sum + item.A, 0);

  return (
    <div className="radar-chart-container">
      <h3>Habeas Corpus por Juzgado</h3>
      
      {/* ✅ INDICADOR DE FILTRO */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '8px', 
        fontSize: '12px', 
        color: '#666',
        fontStyle: 'italic'
      }}>
        📊 {currentFilterLabel}
      </div>
      
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
      
      {/* ✅ PIE ACTUALIZADO */}
      <div style={{ textAlign: "center", marginTop: 12, color: "#888", fontSize: "14px" }}>
        <span style={{ fontWeight: 500 }}>
          Total casos: {totalCasos.toLocaleString()}
        </span>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Período: {currentFilterLabel}
        </div>
      </div>
    </div>
  );
}