import React from 'react';
import { FaEnvelope, FaShare, FaGavel } from 'react-icons/fa';
import useChartsData from '../hooks/useChartsData';
import { getStatsData } from '../utils/chartDataProcessors';

export default function StatsCards() {
  const { correos, reenvios, habeasCorpus, loading, error } = useChartsData();

  if (loading) {
    return (
      <div className="stats-container">
        <div className="stat-card">
          <h3>Cargando estadísticas...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="stat-card error">
          <h3>Error al cargar estadísticas</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = getStatsData(correos, reenvios, habeasCorpus);

  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <FaEnvelope style={{ color: '#003f75', fontSize: '18px' }} />
          Correos
        </h3>
        <div className="stat-number">{stats.totalCorreos}</div>
        <div className="stat-detail">Este mes: {stats.correosThisMonth}</div>
        <div className="stat-detail">Procesados: {stats.correosProcessed}</div>
        <div className="stat-detail">Pendientes: {stats.correosPending}</div>
      </div>

      <div className="stat-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <FaShare style={{ color: '#bafaba', fontSize: '18px' }} />
          Reenvíos
        </h3>
        <div className="stat-number">{stats.totalReenvios}</div>
        <div className="stat-detail">Este mes: {stats.reenviosThisMonth}</div>
      </div>

      <div className="stat-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <FaGavel style={{ color: '#003f75', fontSize: '18px' }} />
          Habeas Corpus
        </h3>
        <div className="stat-number">{stats.totalHabeasCorpus}</div>
        <div className="stat-detail">Activos: {stats.habeasCorpusActivos}</div>
      </div>
    </div>
  );
}