"use client";

import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import useChartsData from "../hooks/useChartsData";
import { processAreaChartData } from "../utils/chartDataProcessors";
import { useChartsContext } from "../contexts/ChartsContext";

export default function AreaChartInteractive() {
  const { timeFilter, filterType, currentFilterLabel } = useChartsContext();
  const { correos, habeasCorpus, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="area-chart-interactive">
        <h1>Correos Recibidos vs Habeas Corpus</h1>
        <div style={{ textAlign: 'center', padding: '50px', color: '#003f75' }}>
          Cargando datos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="area-chart-interactive">
        <h1>Correos Recibidos vs Habeas Corpus</h1>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e53935' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  // ✅ PROCESAR DATOS CON FILTRO GLOBAL
  const chartData = processAreaChartData(correos, habeasCorpus);
  
  // ✅ APLICAR FILTRO SEGÚN EL TIPO SELECCIONADO
  let filteredData = [];
  
  if (filterType === 'days') {
    filteredData = chartData.slice(-timeFilter);
  } else if (filterType === 'months') {
    // Filtrar por meses (aproximadamente 30 días por mes)
    const daysToShow = timeFilter * 30;
    filteredData = chartData.slice(-daysToShow);
  } else if (filterType === 'years') {
    // Filtrar por años (aproximadamente 365 días por año)
    const daysToShow = timeFilter * 365;
    filteredData = chartData.slice(-daysToShow);
  }

  // ✅ CALCULAR ESTADÍSTICAS PARA EL PERÍODO FILTRADO
  const totalCorreos = filteredData.reduce((sum, d) => sum + (d.correosgenerales || 0), 0);
  const totalHabeas = filteredData.reduce((sum, d) => sum + (d.habeasCorpus || 0), 0);
  const promedioCorreos = filteredData.length > 0 ? Math.round(totalCorreos / filteredData.length) : 0;

  // ✅ MANEJAR CASO SIN DATOS
  if (filteredData.length === 0) {
    return (
      <div className="area-chart-interactive">
        <h1>Correos Recibidos vs Habeas Corpus</h1>
        
        <div className="chart-filter-info">
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginBottom: '16px',
            fontSize: '14px',
            fontStyle: 'italic' 
          }}>
            📊 Filtro activo: <strong>{currentFilterLabel}</strong>
          </p>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px', 
          color: '#666',
          fontSize: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            No hay datos disponibles
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            Para el período: <strong>{currentFilterLabel}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="area-chart-interactive">
      <h1>Correos Recibidos vs Habeas Corpus</h1>
      
      {/* ✅ MOSTRAR FILTRO ACTIVO */}
      <div className="chart-filter-info">
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: '16px',
          fontSize: '14px',
          fontStyle: 'italic' 
        }}>
          📊 Mostrando: <strong>{currentFilterLabel}</strong>
        </p>
      </div>
      
      <div className="area-chart-graph">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003f75" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#003f75" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#bafaba" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#bafaba" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={v => {
                const date = new Date(v);
                if (filterType === 'months' || filterType === 'years') {
                  return date.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
                }
                return date.toLocaleDateString("es-CO", { month: "short", day: "numeric" });
              }}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip 
              labelFormatter={v => new Date(v).toLocaleDateString("es-CO", { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
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
            <Area 
              type="monotone" 
              dataKey="correosgenerales" 
              stroke="#003f75" 
              fill="url(#colorDesktop)" 
              name="Todos los correos"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="habeasCorpus" 
              stroke="#bafaba" 
              fill="url(#colorMobile)" 
              name="Habeas Corpus"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* ✅ PIE DE GRÁFICA CON ESTADÍSTICAS ACTUALIZADAS */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: 16, 
        color: '#666', 
        fontSize: '14px',
        borderTop: '1px solid #eee',
        paddingTop: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '0 0 8px 8px',
        padding: '12px'
      }}>
        <div style={{ 
          marginBottom: '8px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span>
            📅 <strong>{filteredData.length}</strong> días
          </span>
          <span>
            📧 <strong>{totalCorreos.toLocaleString()}</strong> correos totales
          </span>
          <span>
            ⚖️ <strong>{totalHabeas.toLocaleString()}</strong> habeas corpus
          </span>
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#888',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span>
            Promedio diario: <strong>{promedioCorreos}</strong> correos
          </span>
          <span>
            Período: <strong>{currentFilterLabel}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
