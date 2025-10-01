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
      const itemDate = new Date(item[dateField] || item.created_at || item.forward_date || item.fecha);
      // ✅ CORREGIR DESFASE: Agregar un día para comparar correctamente
      itemDate.setDate(itemDate.getDate() + 1);
      return itemDate >= cutoffDate;
    });
  };

  const filteredHabeasCorpus = filterData(habeasCorpus, 'created_at');
  const filteredReenvios = filterData(reenvios, 'forward_date');

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
      
      {/* ✅ CONTENEDOR DEL GRÁFICO CON ALTURA AJUSTADA */}
      <div className="radial-chart-container-inner">
        <ResponsiveContainer width="100%" height={280}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="85%"
            barSize={18}
            data={data}
          >
            <RadialBar 
              minAngle={15} 
              background 
              clockWise 
              dataKey="value" 
            />
            {/* ✅ LEYENDA MOVIDA ABAJO */}
            <Legend
              iconSize={8}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px'
              }}
              formatter={(value, entry) => (
                <span style={{ 
                  fontSize: '12px',
                  color: '#666',
                  marginRight: '12px'
                }}>
                  {entry.payload.name}: {entry.payload.percentage}%
                </span>
              )}
            />
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} registros (${props.payload.percentage}%)`, 
                name
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '8px'
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ textAlign: "center", marginTop: 16, color: "#888", fontSize: "14px" }}>
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
