import React from 'react';
import { useChartsContext } from '../../contexts/ChartsContext';

export default function GlobalChartFilters() {
  const { timeFilter, filterType, filterOptions, setGlobalFilter, currentFilterLabel } = useChartsContext();

  return (
    <div className="global-chart-filters">
      <div className="filter-info">
        <h3>Filtro Temporal Global</h3>
        <p>Filtro activo: <strong>{currentFilterLabel}</strong></p>
      </div>
      
      <div className="filter-buttons">
        {filterOptions.map((option) => (
          <button
            key={`${option.value}-${option.type}`}
            className={`filter-btn ${
              timeFilter === option.value && filterType === option.type 
                ? 'active' 
                : ''
            }`}
            onClick={() => setGlobalFilter(option.value, option.type)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}