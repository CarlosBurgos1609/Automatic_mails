import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

export default function TimeRangeFilter({ 
  selectedRange, 
  onRangeChange, 
  showInDialog = false,
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(null);

  // Calcular período actual al cargar
  useEffect(() => {
    const now = dayjs();
    const period = getCurrentPeriod(now);
    setCurrentPeriod(period);
    
    // Si no hay rango seleccionado, usar semestre por defecto
    if (!selectedRange) {
      onRangeChange({
        type: "semestre",
        label: `${period.semestre.label} ${now.year()}`,
        startDate: period.semestre.start,
        endDate: period.semestre.end,
        year: now.year()
      });
    }
  }, []);

  // Función para calcular el período actual
  const getCurrentPeriod = (date) => {
    const year = date.year();
    const month = date.month() + 1; // dayjs months are 0-indexed
    
    // Determinar semestre
    const semestre = month <= 6 ? 1 : 2;
    const semestreStart = semestre === 1 ? dayjs(`${year}-01-01`) : dayjs(`${year}-07-01`);
    const semestreEnd = semestre === 1 ? dayjs(`${year}-06-30`) : dayjs(`${year}-12-31`);
    
    // Determinar trimestre
    let trimestre, trimestreStart, trimestreEnd;
    if (month <= 3) {
      trimestre = 1;
      trimestreStart = dayjs(`${year}-01-01`);
      trimestreEnd = dayjs(`${year}-03-31`);
    } else if (month <= 6) {
      trimestre = 2;
      trimestreStart = dayjs(`${year}-04-01`);
      trimestreEnd = dayjs(`${year}-06-30`);
    } else if (month <= 9) {
      trimestre = 3;
      trimestreStart = dayjs(`${year}-07-01`);
      trimestreEnd = dayjs(`${year}-09-30`);
    } else {
      trimestre = 4;
      trimestreStart = dayjs(`${year}-10-01`);
      trimestreEnd = dayjs(`${year}-12-31`);
    }

    return {
      año: {
        label: `Año ${year}`,
        start: dayjs(`${year}-01-01`),
        end: dayjs(`${year}-12-31`)
      },
      semestre: {
        label: `${semestre === 1 ? 'Primer' : 'Segundo'} Semestre`,
        start: semestreStart,
        end: semestreEnd,
        number: semestre
      },
      trimestre: {
        label: `${trimestre}° Trimestre (${getTrimestreMonths(trimestre)})`,
        start: trimestreStart,
        end: trimestreEnd,
        number: trimestre
      },
      mes: {
        label: date.format('MMMM YYYY'),
        start: date.startOf('month'),
        end: date.endOf('month')
      }
    };
  };

  // Función para obtener los meses del trimestre
  const getTrimestreMonths = (trimestre) => {
    const months = {
      1: "Ene-Mar",
      2: "Abr-Jun", 
      3: "Jul-Sep",
      4: "Oct-Dic"
    };
    return months[trimestre];
  };

  // Generar opciones para el año actual y anteriores
  const generateYearOptions = () => {
    const currentYear = dayjs().year();
    const years = [];
    
    // Incluir año actual y 2 años anteriores
    for (let year = currentYear; year >= currentYear - 2; year--) {
      const period = getCurrentPeriod(dayjs(`${year}-01-01`));
      
      years.push(
        {
          type: "año",
          label: `Año ${year}`,
          startDate: period.año.start,
          endDate: period.año.end,
          year: year
        },
        {
          type: "semestre", 
          label: `Primer Semestre ${year}`,
          startDate: dayjs(`${year}-01-01`),
          endDate: dayjs(`${year}-06-30`),
          year: year,
          semester: 1
        },
        {
          type: "semestre",
          label: `Segundo Semestre ${year}`, 
          startDate: dayjs(`${year}-07-01`),
          endDate: dayjs(`${year}-12-31`),
          year: year,
          semester: 2
        },
        {
          type: "trimestre",
          label: `1° Trimestre ${year} (Ene-Mar)`,
          startDate: dayjs(`${year}-01-01`),
          endDate: dayjs(`${year}-03-31`),
          year: year,
          quarter: 1
        },
        {
          type: "trimestre", 
          label: `2° Trimestre ${year} (Abr-Jun)`,
          startDate: dayjs(`${year}-04-01`),
          endDate: dayjs(`${year}-06-30`),
          year: year,
          quarter: 2
        },
        {
          type: "trimestre",
          label: `3° Trimestre ${year} (Jul-Sep)`,
          startDate: dayjs(`${year}-07-01`),
          endDate: dayjs(`${year}-09-30`),
          year: year,
          quarter: 3
        },
        {
          type: "trimestre",
          label: `4° Trimestre ${year} (Oct-Dic)`,
          startDate: dayjs(`${year}-10-01`),
          endDate: dayjs(`${year}-12-31`),
          year: year,
          quarter: 4
        }
      );

      // Solo agregar meses del año actual
      if (year === currentYear) {
        for (let month = 1; month <= 12; month++) {
          const monthDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`);
          years.push({
            type: "mes",
            label: monthDate.format('MMMM YYYY'),
            startDate: monthDate.startOf('month'),
            endDate: monthDate.endOf('month'),
            year: year,
            month: month
          });
        }
      }
    }
    
    return years;
  };

  const options = generateYearOptions();

  const handleOptionSelect = (option) => {
    onRangeChange(option);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!selectedRange) return "Seleccionar período...";
    return selectedRange.label;
  };

  if (showInDialog) {
    return (
      <div className="time-range-filter-dialog">
        <div className="filter-label">📅 Filtrar por período:</div>
        <div className="dropdown-container">
          <button 
            className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className="selected-text">{getDisplayText()}</span>
            <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
          </button>
          
          {isOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-section">
                <div className="section-title">🗓️ Por Año</div>
                {options.filter(opt => opt.type === "año").map((option, index) => (
                  <button
                    key={`año-${index}`}
                    className={`dropdown-option ${selectedRange?.label === option.label ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              <div className="dropdown-section">
                <div className="section-title">📊 Por Semestre</div>
                {options.filter(opt => opt.type === "semestre").map((option, index) => (
                  <button
                    key={`semestre-${index}`}
                    className={`dropdown-option ${selectedRange?.label === option.label ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              <div className="dropdown-section">
                <div className="section-title">📈 Por Trimestre</div>
                {options.filter(opt => opt.type === "trimestre").map((option, index) => (
                  <button
                    key={`trimestre-${index}`}
                    className={`dropdown-option ${selectedRange?.label === option.label ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              <div className="dropdown-section">
                <div className="section-title">📅 Por Mes (Año Actual)</div>
                {options.filter(opt => opt.type === "mes").map((option, index) => (
                  <button
                    key={`mes-${index}`}
                    className={`dropdown-option ${selectedRange?.label === option.label ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="time-range-filter">
      <select 
        value={selectedRange ? `${selectedRange.type}-${selectedRange.label}` : ""}
        onChange={(e) => {
          const option = options.find(opt => `${opt.type}-${opt.label}` === e.target.value);
          if (option) {
            onRangeChange(option);
          }
        }}
        disabled={disabled}
      >
        <option value="">Seleccionar período...</option>
        <optgroup label="🗓️ Por Año">
          {options.filter(opt => opt.type === "año").map((option, index) => (
            <option key={`año-${index}`} value={`${option.type}-${option.label}`}>
              {option.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="📊 Por Semestre">
          {options.filter(opt => opt.type === "semestre").map((option, index) => (
            <option key={`semestre-${index}`} value={`${option.type}-${option.label}`}>
              {option.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="📈 Por Trimestre">
          {options.filter(opt => opt.type === "trimestre").map((option, index) => (
            <option key={`trimestre-${index}`} value={`${option.type}-${option.label}`}>
              {option.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="📅 Por Mes">
          {options.filter(opt => opt.type === "mes").map((option, index) => (
            <option key={`mes-${index}`} value={`${option.type}-${option.label}`}>
              {option.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}