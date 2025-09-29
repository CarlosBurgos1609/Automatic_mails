import React, { createContext, useContext, useState } from 'react';

const ChartsContext = createContext();

export const useChartsContext = () => {
  const context = useContext(ChartsContext);
  if (!context) {
    throw new Error('useChartsContext debe usarse dentro de ChartsProvider');
  }
  return context;
};

export const ChartsProvider = ({ children }) => {
  const [timeFilter, setTimeFilter] = useState(30); // Por defecto 30 días
  const [filterType, setFilterType] = useState('days'); // 'days', 'weeks', 'months'

  const filterOptions = [
    { value: 1, label: 'Hoy', type: 'days' },
    { value: 3, label: 'Últimos 3 días', type: 'days' },
    { value: 7, label: 'Últimos 7 días', type: 'days' },
    { value: 30, label: 'Últimos 30 días', type: 'days' },
    { value: 90, label: 'Últimos 90 días', type: 'days' },
    { value: 6, label: 'Últimos 6 meses', type: 'months' },
    { value: 1, label: 'Último año', type: 'years' }
  ];

  const setGlobalFilter = (value, type = 'days') => {
    setTimeFilter(value);
    setFilterType(type);
  };

  const value = {
    timeFilter,
    filterType,
    filterOptions,
    setGlobalFilter,
    currentFilterLabel: filterOptions.find(
      option => option.value === timeFilter && option.type === filterType
    )?.label || `Últimos ${timeFilter} días`
  };

  return (
    <ChartsContext.Provider value={value}>
      {children}
    </ChartsContext.Provider>
  );
};