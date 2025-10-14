import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { 
  FaCalendarAlt, 
  FaFileDownload, 
  FaCalendar, 
  FaChartBar, 
  FaChartLine, 
  FaCalendarWeek,
  FaCalendarDay,
  FaCalendarCheck,
  FaChevronDown,
  FaClock
} from "react-icons/fa";

// Componente personalizado de select con iconos
const CustomSelect = ({ value, onChange, options, disabled, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div 
      ref={selectRef}
      className={`custom-select ${className || ''} ${disabled ? 'disabled' : ''}`}
    >
      <div 
        className="custom-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="selected-option">
          {selectedOption?.icon && <span className="option-icon">{selectedOption.icon}</span>}
          {selectedOption?.label || 'Seleccionar...'}
        </span>
        <FaChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </div>
      
      {isOpen && !disabled && (
        <div className="custom-select-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.icon && <span className="option-icon">{option.icon}</span>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TimeRangeFilter({ 
  selectedRange, 
  onRangeChange, 
  showInDialog = false,
  disabled = false 
}) {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedType, setSelectedType] = useState("semestre");
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Calcular período actual al cargar
  useEffect(() => {
    const now = dayjs();
    const currentYear = now.year();
    const currentMonth = now.month() + 1;
    
    // Determinar semestre actual por defecto
    const currentSemester = currentMonth <= 6 ? 1 : 2;
    
    setSelectedYear(currentYear);
    setSelectedType("semestre");
    setSelectedPeriod(currentSemester);
    
    // Si no hay rango seleccionado, usar semestre actual por defecto
    if (!selectedRange) {
      const semestreStart = currentSemester === 1 
        ? dayjs(`${currentYear}-01-01`).startOf('day')
        : dayjs(`${currentYear}-07-01`).startOf('day');
      const semestreEnd = currentSemester === 1 
        ? dayjs(`${currentYear}-06-30`).endOf('day')
        : dayjs(`${currentYear}-12-31`).endOf('day');
      
      onRangeChange({
        type: "semestre",
        label: `${currentSemester === 1 ? 'Primer' : 'Segundo'} Semestre ${currentYear}`,
        startDate: semestreStart,
        endDate: semestreEnd,
        year: currentYear,
        semester: currentSemester
      });
    }
  }, []);

  // Actualizar el rango cuando cambian las selecciones
  useEffect(() => {
    if (selectedYear && selectedType && selectedPeriod !== null) {
      updateTimeRange();
    }
  }, [selectedYear, selectedType, selectedPeriod]);

  const updateTimeRange = () => {
    let range = null;

    switch (selectedType) {
      case "año":
        range = {
          type: "año",
          label: `Año ${selectedYear}`,
          startDate: dayjs(`${selectedYear}-01-01`).startOf('day'),
          endDate: dayjs(`${selectedYear}-12-31`).endOf('day'),
          year: selectedYear
        };
        break;

      case "semestre":
        const semestreStart = selectedPeriod === 1 
          ? dayjs(`${selectedYear}-01-01`).startOf('day')
          : dayjs(`${selectedYear}-07-01`).startOf('day');
        const semestreEnd = selectedPeriod === 1 
          ? dayjs(`${selectedYear}-06-30`).endOf('day')
          : dayjs(`${selectedYear}-12-31`).endOf('day');
        range = {
          type: "semestre",
          label: `${selectedPeriod === 1 ? 'Primer' : 'Segundo'} Semestre ${selectedYear}`,
          startDate: semestreStart,
          endDate: semestreEnd,
          year: selectedYear,
          semester: selectedPeriod
        };
        break;

      case "trimestre":
        let trimestreStart, trimestreEnd;
        const trimestreMonths = ["Ene-Mar", "Abr-Jun", "Jul-Sep", "Oct-Dic"];
        
        switch (selectedPeriod) {
          case 1:
            trimestreStart = dayjs(`${selectedYear}-01-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-03-31`).endOf('day');
            break;
          case 2:
            trimestreStart = dayjs(`${selectedYear}-04-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-06-30`).endOf('day');
            break;
          case 3:
            trimestreStart = dayjs(`${selectedYear}-07-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-09-30`).endOf('day');
            break;
          case 4:
            trimestreStart = dayjs(`${selectedYear}-10-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-12-31`).endOf('day');
            break;
        }
        
        range = {
          type: "trimestre",
          label: `${selectedPeriod}° Trimestre ${selectedYear} (${trimestreMonths[selectedPeriod - 1]})`,
          startDate: trimestreStart,
          endDate: trimestreEnd,
          year: selectedYear,
          quarter: selectedPeriod
        };
        break;

      case "mes":
        const monthDate = dayjs(`${selectedYear}-${selectedPeriod.toString().padStart(2, '0')}-01`);
        range = {
          type: "mes",
          label: monthDate.format('MMMM YYYY'),
          startDate: monthDate.startOf('month'),
          endDate: monthDate.endOf('month'),
          year: selectedYear,
          month: selectedPeriod
        };
        break;
    }

    if (range) {
      onRangeChange(range);
    }
  };

  // Generar años disponibles (actual y 2 años hacia adelante)
  const generateYearOptions = () => {
    const currentYear = dayjs().year();
    const years = [];
    for (let year = currentYear; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years;
  };

  // Generar opciones de período según el tipo seleccionado
  const generatePeriodOptions = () => {
    switch (selectedType) {
      case "año":
        return [{ value: 1, label: `Todo el año ${selectedYear}` }];
      
      case "semestre":
        return [
          { value: 1, label: `Primer Semestre ${selectedYear}` },
          { value: 2, label: `Segundo Semestre ${selectedYear}` }
        ];
      
      case "trimestre":
        return [
          { value: 1, label: `1° Trimestre ${selectedYear} (Ene-Mar)` },
          { value: 2, label: `2° Trimestre ${selectedYear} (Abr-Jun)` },
          { value: 3, label: `3° Trimestre ${selectedYear} (Jul-Sep)` },
          { value: 4, label: `4° Trimestre ${selectedYear} (Oct-Dic)` }
        ];
      
      case "mes":
        const months = [];
        for (let month = 1; month <= 12; month++) {
          const monthDate = dayjs(`${selectedYear}-${month.toString().padStart(2, '0')}-01`);
          months.push({
            value: month,
            label: monthDate.format('MMMM YYYY')
          });
        }
        return months;
      
      default:
        return [];
    }
  };

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    // Resetear período al cambiar tipo
    if (newType === "año") {
      setSelectedPeriod(1);
    } else if (newType === "semestre") {
      // Por defecto al semestre actual
      const currentMonth = dayjs().month() + 1;
      setSelectedPeriod(currentMonth <= 6 ? 1 : 2);
    } else if (newType === "trimestre") {
      // Por defecto al trimestre actual
      const currentMonth = dayjs().month() + 1;
      let currentQuarter = 1;
      if (currentMonth <= 3) currentQuarter = 1;
      else if (currentMonth <= 6) currentQuarter = 2;
      else if (currentMonth <= 9) currentQuarter = 3;
      else currentQuarter = 4;
      setSelectedPeriod(currentQuarter);
    } else if (newType === "mes") {
      // Por defecto al mes actual
      setSelectedPeriod(dayjs().month() + 1);
    }
  };

  const yearOptions = generateYearOptions();
  const periodOptions = generatePeriodOptions();

  // Opciones del tipo con iconos
  const typeOptions = [
    { value: "año", label: "Año", icon: <FaCalendar /> },
    { value: "semestre", label: "Semestre", icon: <FaChartBar /> },
    { value: "trimestre", label: "Trimestre", icon: <FaChartLine /> },
    { value: "mes", label: "Mes", icon: <FaCalendarDay /> }
  ];

  // Opciones del tipo para versión no-dialog (con más texto descriptivo)
  const typeOptionsSimple = [
    { value: "año", label: "Año completo", icon: <FaCalendar /> },
    { value: "semestre", label: "Por Semestre", icon: <FaChartBar /> },
    { value: "trimestre", label: "Por Trimestre", icon: <FaChartLine /> },
    { value: "mes", label: "Por Mes", icon: <FaCalendarDay /> }
  ];

  if (showInDialog) {
    return (
      <div className="time-range-filter-dialog">
        <div className="filter-label"><FaCalendarAlt /> Filtrar por período:</div>
        
        <div className="filter-row">
          {/* Filtro de Año */}
          <div className="filter-group">
            <label className="filter-sublabel"><FaCalendar /> Año:</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              disabled={disabled}
              className="filter-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div className="filter-group">
            <label className="filter-sublabel"><FaChartBar /> Tipo:</label>
            <CustomSelect
              value={selectedType}
              onChange={handleTypeChange}
              options={typeOptions}
              disabled={disabled}
              className="filter-select"
            />
          </div>

          {/* Filtro de Período específico - Solo se muestra si no es "año" */}
          {selectedType !== "año" && (
            <div className="filter-group full-width">
              <label className="filter-sublabel"><FaCalendarWeek /> Período:</label>
              <select 
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                disabled={disabled}
                className="filter-select"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="time-range-filter">
      <div className="filter-row">
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          disabled={disabled}
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        
        <CustomSelect
          value={selectedType}
          onChange={handleTypeChange}
          options={typeOptionsSimple}
          disabled={disabled}
        />
        
        {selectedType !== "año" && (
          <select 
            value={selectedPeriod || ""}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            disabled={disabled}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}