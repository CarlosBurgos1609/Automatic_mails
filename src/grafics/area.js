"use client";

import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FaChartArea, FaCalendarAlt, FaBalanceScale, FaPaperPlane } from "react-icons/fa";
import useChartsData from "../hooks/useChartsData";
import { processAreaChartDataNew } from "../utils/chartDataProcessors";
import { useChartsContext } from "../contexts/ChartsContext";

export default function AreaChartInteractive() {
  const { timeFilter, filterType, currentFilterLabel } = useChartsContext();
  const { habeasCorpus, reenvios, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="area-chart-interactive">
        <h1>Habeas Corpus Recibidos vs Reenvíos</h1>
        <div style={{ textAlign: 'center', padding: '50px', color: '#003f75' }}>
          Cargando datos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="area-chart-interactive">
        <h1>Habeas Corpus Recibidos vs Reenvíos</h1>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e53935' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  // ✅ FILTRAR DATOS ANTES DE PROCESAR CON CORRECCIÓN DE FECHA
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
      const itemDate = new Date(item[dateField] || item.created_at || item.forward_date);
      // ✅ CORREGIR DESFASE: Agregar un día para comparar correctamente
      itemDate.setDate(itemDate.getDate() + 1);
      return itemDate >= cutoffDate;
    });
  };

  const filteredHabeasCorpus = filterData(habeasCorpus, 'created_at');
  const filteredReenvios = filterData(reenvios, 'forward_date');

  // ✅ USAR LA NUEVA FUNCIÓN QUE COMPARA HABEAS CORPUS VS REENVÍOS CON DATOS FILTRADOS
  const chartData = processAreaChartDataNew(filteredHabeasCorpus, filteredReenvios);
  
  // Calcular estadísticas para el período filtrado
  const totalHabeas = chartData.reduce((sum, d) => sum + (d.habeasCorpus || 0), 0);
  const totalReenvios = chartData.reduce((sum, d) => sum + (d.reenvios || 0), 0);
  const promedioHabeas = chartData.length > 0 ? Math.round(totalHabeas / chartData.length) : 0;

  if (chartData.length === 0) {
    return (
      <div className="area-chart-interactive">
        <h1>Habeas Corpus Recibidos vs Reenvíos</h1>
        
        <div className="chart-filter-info">
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginBottom: '16px',
            fontSize: '14px',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <FaChartArea style={{ color: '#003f75', fontSize: '16px' }} />
            <span>Filtro activo: <strong>{currentFilterLabel}</strong></span>
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
          <div style={{ fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <FaChartArea style={{ color: '#ccc', fontSize: '48px' }} />
          </div>
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
      <h1>Habeas Corpus Recibidos vs Reenvíos</h1>
      
      <div className="chart-filter-info">
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: '16px',
          fontSize: '14px',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <FaChartArea style={{ color: '#003f75', fontSize: '16px' }} />
          <span>Mostrando: <strong>{currentFilterLabel}</strong></span>
        </p>
      </div>
      
      <div className="area-chart-graph">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorHabeas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003f75" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#003f75" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorReenvios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#bafaba" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#bafaba" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={v => {
                // ✅ LA FECHA YA ESTÁ CORREGIDA EN EL PROCESADOR
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
              labelFormatter={v => {
                // ✅ LA FECHA YA ESTÁ CORREGIDA EN EL PROCESADOR
                const date = new Date(v);
                return date.toLocaleDateString("es-CO", { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              }}
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
              dataKey="habeasCorpus" 
              stroke="#003f75" 
              fill="url(#colorHabeas)" 
              name="Habeas Corpus Recibidos"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="reenvios" 
              stroke="#bafaba" 
              fill="url(#colorReenvios)" 
              name="Reenvíos Realizados"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaCalendarAlt style={{ color: '#666', fontSize: '14px' }} />
            <strong>{chartData.length}</strong> días
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaBalanceScale style={{ color: '#003f75', fontSize: '14px' }} />
            <strong>{totalHabeas.toLocaleString()}</strong> habeas corpus
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaPaperPlane style={{ color: '#bafaba', fontSize: '14px' }} />
            <strong>{totalReenvios.toLocaleString()}</strong> reenvíos
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
            Promedio diario: <strong>{promedioHabeas}</strong> habeas corpus
          </span>
          <span>
            Período: <strong>{currentFilterLabel}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
